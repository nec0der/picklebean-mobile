import { memo, useState, useCallback } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { User, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { TabScreenProps } from '@/types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLobbyActions } from '@/hooks/actions/useLobbyActions';
import { isValidRoomCode } from '@/lib/roomCode';
import { Button } from '@/components/ui/Button';
import { ErrorMessage, LoadingSpinner } from '@/components/common';
import { GameModeCard } from '@/components/features/play/GameModeCard';
import type { GameMode } from '@/types/lobby';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';

type PlayScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Tab = 'join' | 'host';

export const PlayScreen = memo(({}: TabScreenProps<'Play'>) => {
  const navigation = useNavigation<PlayScreenNavigationProp>();
  const { user, userDocument } = useAuth();
  const { createLobby } = useLobbyActions();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('join');

  // Join state
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Host state
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Handle room code input (auto-uppercase, max 4 chars)
  const handleRoomCodeChange = useCallback((text: string) => {
    const uppercased = text.toUpperCase();
    setRoomCode(uppercased);
    if (joinError) setJoinError(''); // Clear error on change
  }, [joinError]);

  // Handle join game
  const handleJoinGame = useCallback(async () => {
    if (!user || !userDocument) return;

    const code = roomCode.trim();

    // Validate format
    if (!isValidRoomCode(code)) {
      setJoinError('Please enter a valid 4-character room code');
      return;
    }

    setJoinError('');
    setIsJoining(true);

    try {
      // Check if lobby exists
      const lobbyRef = doc(firestore, 'lobbies', code);
      const lobbySnap = await getDoc(lobbyRef);

      if (!lobbySnap.exists()) {
        setJoinError('Lobby not found. Please check the room code.');
        return;
      }

      // Navigate to lobby
      navigation.navigate('LobbyDetail', { roomCode: code });
    } catch (error) {
      console.error('Error joining lobby:', error);
      setJoinError('Failed to join lobby. Please try again.');
    } finally {
      setIsJoining(false);
    }
  }, [user, userDocument, roomCode, navigation]);

  // Handle create game
  const handleCreateGame = useCallback(async () => {
    if (!user || !userDocument || !selectedMode) return;

    setCreateError('');
    setIsCreating(true);

    try {
      // Prepare player data
      const hostData = {
        uid: user.id,
        displayName: userDocument.displayName || user.id,
        photoURL: userDocument.profilePictureUrl || undefined,
      };

      // Create lobby
      const roomCode = await createLobby(user.id, selectedMode, hostData);

      // Navigate to lobby
      navigation.navigate('LobbyDetail', { roomCode });
    } catch (error) {
      console.error('Error creating lobby:', error);
      setCreateError('Failed to create lobby. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [user, userDocument, selectedMode, createLobby, navigation]);

  // Handle mode selection
  const handleModeSelect = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    if (createError) setCreateError(''); // Clear error on selection
  }, [createError]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="max-w-md mx-auto w-full">
          {/* Tab Switcher */}
          <View className="flex-row bg-gray-100 rounded-lg p-1 mb-6">
            <Pressable
              onPress={() => setActiveTab('join')}
              className={`flex-1 py-3 rounded-md ${
                activeTab === 'join' ? 'bg-white' : ''
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'join' ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                Join
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('host')}
              className={`flex-1 py-3 rounded-md ${
                activeTab === 'host' ? 'bg-white' : ''
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'host' ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                Host
              </Text>
            </Pressable>
          </View>

          {/* Tab Content */}
          {activeTab === 'join' ? (
            <View className="gap-4">
              {/* Join Title */}
              <View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  Join Game
                </Text>
                <Text className="text-gray-600">
                  Enter a 4-character room code to join an existing game
                </Text>
              </View>

              {/* Room Code Input */}
              <View>
                <Text className="text-base font-semibold text-gray-700 mb-3">
                  Room Code
                </Text>
                <TextInput
                  value={roomCode}
                  onChangeText={handleRoomCodeChange}
                  placeholder="ABCD"
                  placeholderTextColor="#d1d5db"
                  maxLength={4}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="text-4xl tracking-widest font-bold py-6 px-4 border-2 border-gray-300 rounded-lg bg-white"
                />
              </View>

              {/* Join Error */}
              {joinError && (
                <ErrorMessage message={joinError} />
              )}

              {/* Join Button */}
              <Pressable
                onPress={handleJoinGame}
                disabled={roomCode.length !== 4 || isJoining}
                className={`py-4 rounded-lg bg-green-500 items-center mt-2 ${
                  (roomCode.length !== 4 || isJoining) ? 'opacity-50' : 'active:bg-green-600'
                }`}
              >
                <Text className="text-lg font-bold text-white">
                  {isJoining ? 'Joining...' : 'Join Game'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-4">
              {/* Host Title */}
              <View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  Create Game
                </Text>
                <Text className="text-gray-600">
                  Choose a game mode to start a new match
                </Text>
              </View>

              {/* Game Mode Selection */}
              <View className="gap-3">
                <GameModeCard
                  icon={User}
                  title="Singles (1v1)"
                  description="One-on-one match"
                  subtitle="Same-gender for ranked—keeps it fair!"
                  selected={selectedMode === 'singles'}
                  onPress={() => handleModeSelect('singles')}
                />
                <GameModeCard
                  icon={Users}
                  title="Doubles (2v2)"
                  description="Team match"
                  subtitle="Go mixed or same-gender—both rank up your score."
                  selected={selectedMode === 'doubles'}
                  onPress={() => handleModeSelect('doubles')}
                />
              </View>

              {/* Create Error */}
              {createError && (
                <ErrorMessage message={createError} />
              )}

              {/* Create Button */}
              <Pressable
                onPress={handleCreateGame}
                disabled={!selectedMode || isCreating}
                className={`py-4 rounded-lg bg-green-500 items-center mt-2 ${
                  (!selectedMode || isCreating) ? 'opacity-50' : 'active:bg-green-600'
                }`}
              >
                <Text className="text-lg font-bold text-white">
                  {isCreating ? 'Creating...' : 'Create Game'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

PlayScreen.displayName = 'PlayScreen';
