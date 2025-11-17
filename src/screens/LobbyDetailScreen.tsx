import { memo, useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { X, Copy, Check, User, Users } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLobby } from '@/hooks/firestore/useLobby';
import { useLobbyActions } from '@/hooks/actions/useLobbyActions';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { Card } from '@/components/ui/Card';
import { DraggablePlayerSlot } from '@/components/features/lobby/DraggablePlayerSlot';
import type { Player } from '@/types/lobby';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';

type LobbyDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LobbyDetail'>;

export const LobbyDetailScreen = memo(({ route }: RootStackScreenProps<'LobbyDetail'>) => {
  const { roomCode } = route.params;
  const navigation = useNavigation<LobbyDetailNavigationProp>();
  const { user, userDocument } = useAuth();
  const { lobby, loading, error, exists } = useLobby(roomCode);
  const { joinLobby, leaveLobby, deleteLobby } = useLobbyActions();

  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState<{
    team: number;
    slot: number;
    player: Player;
  } | null>(null);
  const [draggedCardSize, setDraggedCardSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [slotPositions, setSlotPositions] = useState<Record<string, {
    x: number;
    y: number;
    width: number;
    height: number;
  }>>({});
  const [activeDropZone, setActiveDropZone] = useState<{
    team: number;
    slot: number;
  } | null>(null);

  // Check if current user is host
  const isHost = user?.id === lobby?.hostId;

  // Position tracking handler
  const handleSlotLayout = useCallback((
    team: number,
    slot: number,
    layout: { x: number; y: number; width: number; height: number }
  ) => {
    setSlotPositions(prev => ({
      ...prev,
      [`${team}-${slot}`]: layout
    }));
  }, []);

  // Calculate which slot the drag is over using AABB intersection
  const calculateDropTarget = useCallback((
    x: number, 
    y: number,
    cardWidth: number,
    cardHeight: number
  ): {
    team: number;
    slot: number;
  } | null => {
    console.log('🔍 calculateDropTarget called:', { x, y, cardWidth, cardHeight });
    console.log('📦 slotPositions keys:', Object.keys(slotPositions));
    
    if (!cardWidth || !cardHeight) {
      console.log('❌ No card dimensions!');
      return null;
    }

    // Dragged card bounds (center point is x,y)
    const draggedTop = y - (cardHeight / 2);
    const draggedBottom = y + (cardHeight / 2);
    const draggedLeft = x - (cardWidth / 2);
    const draggedRight = x + (cardWidth / 2);
    
    console.log('📐 Dragged card bounds:', {
      top: draggedTop,
      bottom: draggedBottom,
      left: draggedLeft,
      right: draggedRight
    });

    for (const [key, pos] of Object.entries(slotPositions)) {
      const [team, slot] = key.split('-').map(Number);
      
      console.log(`Checking slot ${key}:`, pos);
      
      // Check if dragged card overlaps with this slot (AABB intersection)
      const verticalOverlap = 
        draggedBottom > pos.y && 
        draggedTop < pos.y + pos.height;
      
      const horizontalOverlap =
        draggedRight > pos.x &&
        draggedLeft < pos.x + pos.width;
      
      console.log(`  Overlaps: vertical=${verticalOverlap}, horizontal=${horizontalOverlap}`);
      
      if (verticalOverlap && horizontalOverlap) {
        console.log(`✅ Found match: team ${team}, slot ${slot}`);
        return { team, slot };
      }
    }
    
    console.log('❌ No overlapping slot found');
    return null;
  }, [slotPositions]);

  // Drag & drop handlers
  const handleDragStart = useCallback((
    team: number, 
    slot: number, 
    width: number, 
    height: number
  ) => {
    console.log('🟢 DRAG START:', { team, slot, width, height });
    console.log('📍 slotPositions:', JSON.stringify(slotPositions, null, 2));
    if (!lobby) return;
    const player = lobby[`team${team as 1 | 2}`][`player${slot as 1 | 2}`];
    if (player) {
      setDraggedPlayer({ team, slot, player });
      setDraggedCardSize({ width, height });
    }
  }, [lobby, slotPositions]);

  // Update active drop zone during drag
  const handleDragMove = useCallback((x: number, y: number) => {
    console.log('🔵 DRAG MOVE:', { x, y, draggedCardSize });
    if (!draggedCardSize) {
      console.log('❌ No draggedCardSize!');
      return;
    }
    const dropTarget = calculateDropTarget(
      x, 
      y, 
      draggedCardSize.width, 
      draggedCardSize.height
    );
    console.log('🎯 dropTarget:', dropTarget);
    setActiveDropZone(dropTarget);
  }, [calculateDropTarget, draggedCardSize]);

  // Handle drop with calculated position
  const handleDragEnd = useCallback(async (x: number, y: number) => {
    if (!draggedPlayer || !lobby || !roomCode || !draggedCardSize) return;
    
    const dropTarget = calculateDropTarget(
      x, 
      y, 
      draggedCardSize.width, 
      draggedCardSize.height
    );
    setActiveDropZone(null);
    
    if (!dropTarget) {
      // Dropped outside any slot
      setDraggedPlayer(null);
      return;
    }
    
    const sourceTeam = draggedPlayer.team;
    const sourceSlot = draggedPlayer.slot;
    const targetTeam = dropTarget.team;
    const targetSlot = dropTarget.slot;

    // Can't drop on same slot
    if (sourceTeam === targetTeam && sourceSlot === targetSlot) {
      setDraggedPlayer(null);
      return;
    }

    try {
      const lobbyRef = doc(firestore, 'lobbies', roomCode);
      const targetPlayer = lobby[`team${targetTeam as 1 | 2}`][`player${targetSlot as 1 | 2}`];

      // Swap players
      await updateDoc(lobbyRef, {
        [`team${sourceTeam}.player${sourceSlot}`]: targetPlayer || {},
        [`team${targetTeam}.player${targetSlot}`]: draggedPlayer.player,
        lastActivity: new Date(),
      });
    } catch (err) {
      console.error('Error moving player:', err);
      Alert.alert('Error', 'Failed to move player');
    } finally {
      setDraggedPlayer(null);
    }
  }, [draggedPlayer, lobby, roomCode, calculateDropTarget]);

  // Check if user is in lobby
  const isInLobby = useCallback(() => {
    if (!lobby || !user) return false;
    
    return !!(
      lobby.team1.player1?.uid === user.id ||
      lobby.team1.player2?.uid === user.id ||
      lobby.team2.player1?.uid === user.id ||
      lobby.team2.player2?.uid === user.id
    );
  }, [lobby, user]);

  // Auto-join when lobby loads
  useEffect(() => {
    if (!lobby || !user || !userDocument || isJoining || isInLobby()) return;

    const currentCount = getCurrentPlayerCount();
    const capacity = lobby.gameMode === 'singles' ? 2 : 4;

    if (currentCount < capacity) {
      handleAutoJoin();
    }
  }, [lobby, user, userDocument]);

  const getCurrentPlayerCount = (): number => {
    if (!lobby) return 0;
    
    let count = 0;
    if (lobby.team1.player1?.uid) count++;
    if (lobby.team1.player2?.uid) count++;
    if (lobby.team2.player1?.uid) count++;
    if (lobby.team2.player2?.uid) count++;
    
    return count;
  };

  const handleAutoJoin = async () => {
    if (!user || !userDocument || !lobby) return;

    setIsJoining(true);
    try {
      // Prepare player data - only include photoURL if it exists
      const player: any = {
        uid: user.id,
        displayName: userDocument.displayName || user.email || 'Unknown',
      };
      
      // Only add photoURL if it exists (Firestore doesn't accept undefined)
      if (userDocument.profilePictureUrl) {
        player.photoURL = userDocument.profilePictureUrl;
      }

      // Find first empty slot
      let targetTeam: 1 | 2 = 1;
      let targetSlot: 1 | 2 = 1;

      if (lobby.gameMode === 'singles') {
        // Singles: opposing teams
        const hasTeam1 = !!lobby.team1.player1?.uid;
        const hasTeam2 = !!lobby.team2.player1?.uid;
        
        if (!hasTeam1) {
          targetTeam = 1;
        } else if (!hasTeam2) {
          targetTeam = 2;
        }
        targetSlot = 1;
      } else {
        // Doubles: fill Team 1 first, then Team 2
        if (!lobby.team1.player1?.uid) {
          targetTeam = 1;
          targetSlot = 1;
        } else if (!lobby.team1.player2?.uid) {
          targetTeam = 1;
          targetSlot = 2;
        } else if (!lobby.team2.player1?.uid) {
          targetTeam = 2;
          targetSlot = 1;
        } else if (!lobby.team2.player2?.uid) {
          targetTeam = 2;
          targetSlot = 2;
        }
      }

      const lobbyRef = doc(firestore, 'lobbies', roomCode);
      await updateDoc(lobbyRef, {
        [`team${targetTeam}.player${targetSlot}`]: player,
        lastActivity: new Date(),
      });
    } catch (err) {
      console.error('Error auto-joining lobby:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      Clipboard.setString(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Lobby?',
      'Are you sure you want to leave this lobby?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsLeaving(true);
            try {
              await leaveLobby(roomCode, user!.id);
              navigation.goBack();
            } catch (err) {
              console.error('Error leaving lobby:', err);
              Alert.alert('Error', 'Failed to leave lobby. Please try again.');
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Close Lobby?',
      'Are you sure you want to close this lobby? All players will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            setIsLeaving(true);
            try {
              await deleteLobby(roomCode);
              navigation.goBack();
            } catch (err) {
              console.error('Error closing lobby:', err);
              Alert.alert('Error', 'Failed to close lobby. Please try again.');
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  const handleStartGame = async () => {
    if (!roomCode || !lobby || !canStartGame()) return;

    try {
      const lobbyRef = doc(firestore, 'lobbies', roomCode);
      await updateDoc(lobbyRef, {
        gameStarted: true,
        gameStartedAt: new Date(),
        lastActivity: new Date(),
      });

      // Navigate to game screen (placeholder - will be implemented in next phase)
      Alert.alert('Game Starting!', 'Game screen will be implemented next!');
      // TODO: navigation.navigate('Game', { roomCode });
    } catch (err) {
      console.error('Error starting game:', err);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    }
  };

  const canStartGame = (): boolean => {
    if (!lobby) return false;
    
    if (lobby.gameMode === 'singles') {
      return !!(lobby.team1.player1?.uid && lobby.team2.player1?.uid);
    } else {
      return !!(
        lobby.team1.player1?.uid &&
        lobby.team1.player2?.uid &&
        lobby.team2.player1?.uid &&
        lobby.team2.player2?.uid
      );
    }
  };

  const isRoomFull = (): boolean => {
    if (!lobby) return false;
    
    const capacity = lobby.gameMode === 'singles' ? 2 : 4;
    return getCurrentPlayerCount() >= capacity;
  };

  const isUserInLobby = (): boolean => {
    if (!lobby || !user) return false;
    
    return !!(
      lobby.team1.player1?.uid === user.id ||
      lobby.team1.player2?.uid === user.id ||
      lobby.team2.player1?.uid === user.id ||
      lobby.team2.player2?.uid === user.id
    );
  };

  // Loading state
  if (loading || isJoining || isLeaving) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LoadingSpinner />
        <Text className="text-gray-600 mt-4">
          {isLeaving ? 'Leaving lobby...' : isJoining ? 'Joining lobby...' : 'Loading lobby...'}
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !exists || !lobby) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-4 py-6">
          <ErrorMessage
            message={typeof error === 'string' ? error : error?.message || "Lobby not found. It may have been closed."}
          />
          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-4 py-3 bg-green-500 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Back to Play</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200 flex-row items-center justify-center relative">
        <Text className="text-xl font-bold text-gray-900">Lobby</Text>
        <Pressable
          onPress={isHost ? handleClose : handleLeave}
          className="absolute right-4 p-2"
        >
          <X size={24} color="#ef4444" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: isHost ? 100 : 20 }}>
        <View className="max-w-md mx-auto w-full space-y-6">
          {/* Room Code */}
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-700 mb-3">
              Room Code
            </Text>
            <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-lg">
              <Text className="text-3xl font-bold tracking-widest text-blue-600 mr-3">
                {roomCode}
              </Text>
              <Pressable onPress={handleCopyCode} className="p-2">
                {copied ? (
                  <Check size={24} color="#22c55e" />
                ) : (
                  <Copy size={24} color="#6b7280" />
                )}
              </Pressable>
            </View>
            {copied && (
              <Text className="text-sm text-green-600 mt-2">Copied!</Text>
            )}
          </View>

          {/* Game Mode */}
          <View className="flex-row items-center justify-center space-x-2 mt-6">
            {lobby.gameMode === 'singles' ? (
              <User size={20} color="#3b82f6" />
            ) : (
              <Users size={20} color="#a855f7" />
            )}
            <Text className="text-base font-medium text-gray-900">
              {lobby.gameMode === 'singles' ? 'Singles (1v1)' : 'Doubles (2v2)'}
            </Text>
          </View>

          {/* Room Full Message */}
          {isRoomFull() && !isUserInLobby() && (
            <View className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-red-600 font-medium text-center">
                Room is full ({getCurrentPlayerCount()}/{lobby.gameMode === 'singles' ? 2 : 4})
              </Text>
            </View>
          )}

          {/* Teams */}
          <View className="space-y-6">
            {/* Team 1 */}
            <Card className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Team 1</Text>
              <View className="gap-3">
                <DraggablePlayerSlot
                  player={lobby.team1.player1}
                  teamNumber={1}
                  slotNumber={1}
                  isHost={isHost}
                  isCurrentUser={lobby.team1.player1?.uid === user?.id}
                  hostId={lobby.hostId}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onLayout={handleSlotLayout}
                  isHighlighted={
                    activeDropZone?.team === 1 && 
                    activeDropZone?.slot === 1 &&
                    !(draggedPlayer?.team === 1 && draggedPlayer?.slot === 1)
                  }
                />
                {lobby.gameMode === 'doubles' && (
                  <DraggablePlayerSlot
                    player={lobby.team1.player2}
                    teamNumber={1}
                    slotNumber={2}
                    isHost={isHost}
                    isCurrentUser={lobby.team1.player2?.uid === user?.id}
                    hostId={lobby.hostId}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onLayout={handleSlotLayout}
                    isHighlighted={
                      activeDropZone?.team === 1 && 
                      activeDropZone?.slot === 2 &&
                      !(draggedPlayer?.team === 1 && draggedPlayer?.slot === 2)
                    }
                  />
                )}
              </View>
            </Card>

            {/* Team 2 */}
            <Card className="p-4">
              <Text className="text-lg font-bold text-gray-900 mb-3">Team 2</Text>
              <View className="gap-3">
                <DraggablePlayerSlot
                  player={lobby.team2.player1}
                  teamNumber={2}
                  slotNumber={1}
                  isHost={isHost}
                  isCurrentUser={lobby.team2.player1?.uid === user?.id}
                  hostId={lobby.hostId}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onLayout={handleSlotLayout}
                  isHighlighted={
                    activeDropZone?.team === 2 && 
                    activeDropZone?.slot === 1 &&
                    !(draggedPlayer?.team === 2 && draggedPlayer?.slot === 1)
                  }
                />
                {lobby.gameMode === 'doubles' && (
                  <DraggablePlayerSlot
                    player={lobby.team2.player2}
                    teamNumber={2}
                    slotNumber={2}
                    isHost={isHost}
                    isCurrentUser={lobby.team2.player2?.uid === user?.id}
                    hostId={lobby.hostId}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onLayout={handleSlotLayout}
                    isHighlighted={
                      activeDropZone?.team === 2 && 
                      activeDropZone?.slot === 2 &&
                      !(draggedPlayer?.team === 2 && draggedPlayer?.slot === 2)
                    }
                  />
                )}
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Start Game Button (Host Only) */}
      {isHost && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <Pressable
            onPress={handleStartGame}
            disabled={!canStartGame()}
            className={`py-4 rounded-lg items-center ${
              canStartGame()
                ? 'bg-green-500 active:bg-green-600'
                : 'bg-gray-300'
            }`}
          >
            <Text className="text-lg font-bold text-white">
              Start Game
            </Text>
          </Pressable>
        </View>
      )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
});
LobbyDetailScreen.displayName = 'LobbyDetailScreen';
