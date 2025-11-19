import { memo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Crown } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLobby } from '@/hooks/firestore/useLobby';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { GameTimer } from '@/components/game/GameTimer';
import type { Player } from '@/types/lobby';

type GameNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export const GameScreen = memo(({ route }: RootStackScreenProps<'Game'>) => {
  const { roomCode } = route.params;
  const navigation = useNavigation<GameNavigationProp>();
  const { user } = useAuth();
  const { lobby, loading, error, exists } = useLobby(roomCode);

  const isHost = user?.id === lobby?.hostId;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleLeaveGame = useCallback(() => {
    Alert.alert(
      'Leave Game?',
      'Are you sure you want to leave the game in progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('Tabs');
          },
        },
      ]
    );
  }, [navigation]);

  const handleCompleteGame = useCallback(() => {
    Alert.alert(
      'Complete Game',
      'Ready to enter final scores?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter Scores',
          onPress: () => {
            Alert.alert('Score Entry', 'Score entry will be implemented in Phase 3C!');
            // TODO: Navigate to score entry
          },
        },
      ]
    );
  }, []);

  const renderPlayer = useCallback(
    (player: Player | undefined, teamNumber: number) => {
      if (!player) {
        return (
          <View className="flex-row items-center gap-3 p-3 rounded-lg bg-gray-50">
            <View className="w-10 h-10 bg-gray-200 rounded-full" />
            <Text className="flex-1 text-gray-400">Empty slot</Text>
          </View>
        );
      }

      const isCurrentUser = player.uid === user?.id;
      const isHostPlayer = player.uid === lobby?.hostId;

      return (
        <View className="flex-row items-center gap-3 p-3 bg-white rounded-lg">
          <Avatar
            uri={player.photoURL}
            name={player.displayName}
            size="md"
          />
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {player.displayName}
            </Text>
          </View>
          <View className="flex-row gap-2">
            {isCurrentUser && (
              <View className="px-2 py-1 bg-blue-100 rounded">
                <Text className="text-xs font-semibold text-blue-700">You</Text>
              </View>
            )}
            {isHostPlayer && (
              <View className="flex-row items-center gap-1 px-2 py-1 bg-yellow-100 rounded">
                <Crown size={12} color="#ca8a04" />
                <Text className="text-xs font-semibold text-yellow-700">Host</Text>
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
              onPress={handleBack}
              className="py-3 mt-4 bg-green-500 rounded-lg"
            >
              <Text className="font-semibold text-center text-white">
                Back
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
              onPress={handleBack}
              className="py-3 mt-4 bg-green-500 rounded-lg"
            >
              <Text className="font-semibold text-center text-white">
                Back to Lobby
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Pressable onPress={handleBack} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <View className="items-center">
          <Text className="text-xs font-medium text-gray-500">Room Code</Text>
          <Text className="text-lg font-bold text-gray-900">{roomCode}</Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-4">
          {/* Timer */}
          <GameTimer startedAt={lobby.gameStartedAt.toDate()} />

          {/* Game Mode */}
          <View className="flex-row items-center justify-center py-4">
            <View className="px-4 py-2 bg-purple-100 rounded-full">
              <Text className="font-semibold text-purple-700">
                {lobby.gameMode === 'singles' ? 'Singles (1v1)' : 'Doubles (2v2)'}
              </Text>
            </View>
          </View>

          {/* Teams */}
          <View className="gap-4 mt-4">
            {/* Team 1 */}
            <Card className="p-4">
              <Text className="mb-3 text-lg font-bold text-gray-900">
                Team 1
              </Text>
              <View className="gap-3">
                {renderPlayer(lobby.team1.player1, 1)}
                {lobby.gameMode === 'doubles' && renderPlayer(lobby.team1.player2, 1)}
              </View>
            </Card>

            {/* VS Divider */}
            <View className="items-center py-2">
              <View className="px-4 py-1 bg-gray-100 rounded-full">
                <Text className="text-sm font-bold text-gray-600">VS</Text>
              </View>
            </View>

            {/* Team 2 */}
            <Card className="p-4">
              <Text className="mb-3 text-lg font-bold text-gray-900">
                Team 2
              </Text>
              <View className="gap-3">
                {renderPlayer(lobby.team2.player1, 2)}
                {lobby.gameMode === 'doubles' && renderPlayer(lobby.team2.player2, 2)}
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        {isHost ? (
          <View className="gap-2">
            <Pressable
              onPress={handleCompleteGame}
              className="items-center py-4 bg-green-500 rounded-lg active:bg-green-600"
            >
              <Text className="text-lg font-bold text-white">
                Complete Game
              </Text>
            </Pressable>
            <Pressable
              onPress={handleLeaveGame}
              className="items-center py-3 bg-gray-100 rounded-lg active:bg-gray-200"
            >
              <Text className="font-semibold text-gray-700">Leave Game</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleLeaveGame}
            className="items-center py-4 bg-red-500 rounded-lg active:bg-red-600"
          >
            <Text className="text-lg font-bold text-white">Leave Game</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
});

GameScreen.displayName = 'GameScreen';
