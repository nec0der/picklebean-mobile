import { memo, useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Crown, X } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLobby } from '@/hooks/firestore/useLobby';
import { useStakesCalculation } from '@/hooks/game/useStakesCalculation';
import { useToast } from '@/hooks/common/useToast';
import { useAlert } from '@/hooks/common/useAlert';
import { LoadingSpinner, ErrorMessage, ScreenHeader } from '@/components/common';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { GameTimer } from '@/components/game/GameTimer';
import { ScorePickerSheet } from '@/components/game/ScorePickerSheet';
import { CancelMatchSheet } from '@/components/game/CancelMatchSheet';
import { GameSummary } from '@/components/game/GameSummary';
import { completeMatch, calculateGameDuration } from '@/lib/matchHistory';
import { cancelMatch, createRematch } from '@/services/lobbyService';
import type { Player } from '@/types/lobby';

type GameNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export const GameScreen = memo(({ route }: RootStackScreenProps<'Game'>) => {
  const { roomCode } = route.params;
  const navigation = useNavigation<GameNavigationProp>();
  const { user } = useAuth();
  const { lobby, loading, error, exists} = useLobby(roomCode);
  const toast = useToast();
  const alert = useAlert();
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const insets = useSafeAreaInsets();

  const isHost = user?.id === lobby?.hostId;

  // Disable swipe-back gesture during active game
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  // Determine game category for stakes calculation
  const getGameCategory = (): 'singles' | 'same_gender_doubles' | 'mixed_doubles' => {
    if (!lobby) return 'singles';
    if (lobby.gameMode === 'singles') return 'singles';
    // For doubles, use stored category or default to same_gender_doubles
    return lobby.gameCategory || 'same_gender_doubles';
  };

  // Extract player UIDs for stakes calculation (stable references)
  const team1PlayerIds = useMemo(() => {
    if (!lobby) return [];
    if (lobby.gameMode === 'singles') {
      return lobby.team1.player1?.uid ? [lobby.team1.player1.uid] : [];
    }
    return [
      lobby.team1.player1?.uid,
      lobby.team1.player2?.uid
    ].filter(Boolean) as string[];
  }, [lobby?.gameMode, lobby?.team1.player1?.uid, lobby?.team1.player2?.uid]);

  const team2PlayerIds = useMemo(() => {
    if (!lobby) return [];
    if (lobby.gameMode === 'singles') {
      return lobby.team2.player1?.uid ? [lobby.team2.player1.uid] : [];
    }
    return [
      lobby.team2.player1?.uid,
      lobby.team2.player2?.uid
    ].filter(Boolean) as string[];
  }, [lobby?.gameMode, lobby?.team2.player1?.uid, lobby?.team2.player2?.uid]);

  const stakesData = useStakesCalculation(
    team1PlayerIds,
    team2PlayerIds,
    lobby?.gameMode || 'doubles',
    getGameCategory()
  );

  const handleLeaveGame = useCallback(() => {
    alert.confirm(
      'Leave Game?',
      'Are you sure you want to leave the game in progress?',
      {
        onConfirm: () => {
          navigation.navigate('Tabs');
        },
        confirmText: 'Leave',
        confirmStyle: 'destructive',
      }
    );
  }, [navigation, alert]);

  const handleCompleteGame = useCallback(() => {
    setShowScoreEntry(true);
  }, []);

  const handleSubmitScores = useCallback(async (team1Score: number, team2Score: number) => {
    if (!lobby || !lobby.gameStartedAt) {
      throw new Error('Game data not available');
    }

    if (!stakesData || stakesData.loading) {
      throw new Error('Point calculation not ready');
    }

    try {
      // Determine winner
      const winner = team1Score > team2Score ? 1 : 2;
      
      // Calculate game duration
      const gameDuration = calculateGameDuration(lobby.gameStartedAt.toDate());

      // Calculate REAL point changes based on winner
      const pointChanges = {
        team1: winner === 1 ? stakesData.team1Win : -stakesData.team1Loss,
        team2: winner === 2 ? stakesData.team2Win : -stakesData.team2Loss,
      };

      // Store stakes snapshot for debugging/audit
      const stakesSnapshot = {
        team1Win: stakesData.team1Win,
        team1Loss: stakesData.team1Loss,
        team2Win: stakesData.team2Win,
        team2Loss: stakesData.team2Loss,
      };

      // Complete match with REAL calculated points
      await completeMatch(lobby, {
        team1Score,
        team2Score,
        winner,
        gameDuration,
        pointChanges,
        stakesSnapshot,
      });

      // Close modal - user will see GameSummary screen automatically
      setShowScoreEntry(false);
    } catch (err) {
      console.error('Error completing match:', err);
      throw new Error('Failed to complete match. Please try again.');
    }
  }, [lobby, stakesData]);

  const handlePlayAgain = useCallback(() => {
    navigation.navigate('Tabs');
  }, [navigation]);

  const handleRematch = useCallback(async () => {
    if (!lobby) return;
    
    try {
      const newRoomCode = await createRematch(lobby);
      toast.success(`Rematch created! New lobby: ${newRoomCode}`);
      // Navigate after short delay to let toast show
      setTimeout(() => {
        navigation.replace('LobbyDetail', { roomCode: newRoomCode });
      }, 500);
    } catch (err) {
      console.error('Error creating rematch:', err);
      toast.error('Failed to create rematch. Please try again.');
    }
  }, [lobby, navigation, toast]);

  const handleCancelMatch = useCallback(async (): Promise<void> => {
    try {
      if (!user?.id) return;
      await cancelMatch(roomCode, user.id, '');
      navigation.navigate('Tabs');
    } catch (err) {
      console.error('Error cancelling match:', err);
      toast.error('Failed to cancel match. Please try again.');
    }
  }, [roomCode, user?.id, navigation, toast]);

  const renderPlayer = useCallback(
    (player: Player | undefined, teamNumber: number) => {
      if (!player) {
      return (
        <View className="flex-row items-center gap-3 p-3 rounded-lg bg-gray-50">
          <View className="w-10 h-10 bg-gray-200 rounded-full" />
          <Text className="flex-1 !text-gray-400">Empty slot</Text>
        </View>
      );
      }

      const isCurrentUser = player.uid === user?.id;
      const isHostPlayer = player.uid === lobby?.hostId;

      return (
        <View className="flex-row items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
          <Avatar
            uri={player.photoURL}
            name={player.displayName}
            size="md"
          />
          <View className="flex-1">
            <Text className="text-base font-semibold !text-gray-900">
              {player.displayName}
            </Text>
          </View>
          <View className="flex-row gap-2">
            {isCurrentUser && (
              <View className="px-2 py-1 bg-blue-100 rounded">
                <Text className="text-xs font-semibold !text-blue-700">You</Text>
              </View>
            )}
            {isHostPlayer && (
              <View className="flex-row items-center gap-1 px-2 py-1 bg-yellow-100 rounded">
                <Crown size={12} color="#ca8a04" />
                <Text className="text-xs font-semibold !text-yellow-700">Host</Text>
              </View>
            )}
          </View>
        </View>
      );
    },
    [user?.id, lobby?.hostId]
  );

  // Loading state
  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner />
        <Text className="mt-4 text-gray-600">Loading game...</Text>
      </View>
    );
  }

  // Error state
  if (error || !exists || !lobby) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={['top']}>
          <View className="px-4 py-6">
            <ErrorMessage
              message={
                typeof error === 'string'
                  ? error
                  : error?.message || 'Game not found.'
              }
            />
            <Pressable
              onPress={() => navigation.navigate('Tabs')}
              className="py-3 mt-4 bg-green-500 rounded-lg"
            >
              <Text className="font-semibold text-center text-white">
                Back to Home
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Game not started yet
  if (!lobby.gameStarted || !lobby.gameStartedAt) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={['top']}>
          <View className="px-4 py-6">
            <ErrorMessage message="Game has not started yet." />
            <Pressable
              onPress={() => navigation.navigate('Tabs')}
              className="py-3 mt-4 bg-green-500 rounded-lg"
            >
              <Text className="font-semibold text-center text-white">
                Back to Home
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Show game summary if game is completed
  if (lobby.gameCompleted && user?.id) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <GameSummary
          lobby={lobby}
          currentUserId={user.id}
          currentUserName={user.displayName || 'Player'}
          onPlayAgain={handlePlayAgain}
          onRematch={isHost ? handleRematch : undefined}
        />
      </SafeAreaView>
    );
  }

  // Active game view
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        leftAction="close"
        onLeftPress={isHost ? () => setShowCancelModal(true) : undefined}
        titleComponent={
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 bg-red-500 rounded-full" />
            <Text className="text-lg font-bold !text-gray-900">Playing</Text>
          </View>
        }
      />

      {/* Cancel Match Sheet */}
      <CancelMatchSheet
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelMatch}
      />

      {/* Game Status Bar - HUGE Timer as Hero */}
      <View className="items-center px-4 py-6 bg-white border-b border-gray-200">
        {/* Massive Timer - No Label */}
        <GameTimer startedAt={lobby.gameStartedAt.toDate()} />
        
        {/* Game Mode + Room Code - Small, Secondary */}
        <View className="flex-row items-center gap-2 mt-3">
          <Text className="text-xs !text-gray-500">
            {lobby.gameMode === 'singles' ? 'Singles (1v1)' : 'Doubles (2v2)'}
          </Text>
          <Text className="text-xs !text-gray-400">•</Text>
          <Text className="text-xs !text-gray-500">
            Room: {roomCode}
          </Text>
        </View>
      </View>
      

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: isHost ? 100 : 20 }}
      >
        <View className="px-4 py-6">
          {/* Teams */}
          <View className="gap-6">
            {/* Team 1 - Darker for active game */}
            <Card variant="outlined" padding="lg" className="bg-green-100 border-green-300">
              <View className="flex-row items-start justify-between mb-3">
                <Text className="text-base font-semibold !text-green-800">
                  Team 1
                </Text>
                {stakesData && !stakesData.loading && (
                  <Text className="text-xs !text-green-700">
                    Win: +{stakesData.team1Win} | Lose: -{stakesData.team1Loss}
                  </Text>
                )}
              </View>
              <View className="gap-3">
                {renderPlayer(lobby.team1.player1, 1)}
                {lobby.gameMode === 'doubles' && renderPlayer(lobby.team1.player2, 1)}
              </View>
            </Card>

            {/* VS Divider - Minimal */}
            <View className="flex-row items-center justify-center py-3">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-3 text-sm font-medium !text-gray-500">vs</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Team 2 - Darker for active game */}
            <Card variant="outlined" padding="lg" className="bg-blue-100 !border-blue-300">
              <View className="flex-row items-start justify-between mb-3">
                <Text className="text-base font-semibold !text-blue-800">
                  Team 2
                </Text>
                {stakesData && !stakesData.loading && (
                  <Text className="text-xs !text-blue-700">
                    Win: +{stakesData.team2Win} | Lose: -{stakesData.team2Loss}
                  </Text>
                )}
              </View>
              <View className="gap-3">
                {renderPlayer(lobby.team2.player1, 2)}
                {lobby.gameMode === 'doubles' && renderPlayer(lobby.team2.player2, 2)}
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom - Complete Game Button (Host Only) with Safe Area */}
      {isHost && (
        <View 
          className="absolute bottom-0 left-0 right-0 px-4 pt-4 bg-white border-t border-gray-200"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            onPress={handleCompleteGame}
            className="items-center py-4 bg-green-500 rounded-lg active:bg-green-600"
          >
            <Text className="text-lg font-bold !text-white">
              Complete Game
            </Text>
          </Pressable>
        </View>
      )}

      {/* Score Picker Sheet */}
      <ScorePickerSheet
        visible={showScoreEntry}
        onClose={() => setShowScoreEntry(false)}
        onSubmit={handleSubmitScores}
        defaultTeam1Score={0}
        defaultTeam2Score={0}
      />
    </SafeAreaView>
  );
});

GameScreen.displayName = 'GameScreen';
