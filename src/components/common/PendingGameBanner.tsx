import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { PendingGame } from '@/hooks/firestore/usePendingGame';
import { AlertCircle } from 'lucide-react-native';

interface PendingGameBannerProps {
  pendingGame: PendingGame;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PendingGameBanner = memo(({ pendingGame }: PendingGameBannerProps) => {
  const navigation = useNavigation<NavigationProp>();

  const handleReturn = () => {
    navigation.navigate('LobbyDetail', { roomCode: pendingGame.roomCode });
  };

  return (
    <View className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
      <View className="flex-row items-start">
        <AlertCircle size={20} color="#f59e0b" className="mt-0.5 mr-2" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-yellow-900 mb-1">
            Active {pendingGame.type === 'game' ? 'Game' : 'Lobby'}
          </Text>
          <Text className="text-sm text-yellow-800 mb-3">
            You have an active {pendingGame.type === 'game' ? 'game' : 'lobby'}. 
            Complete or leave it to start a new one.
          </Text>
          <Pressable
            onPress={handleReturn}
            className="self-start px-4 py-2 bg-yellow-500 rounded-lg active:bg-yellow-600"
          >
            <Text className="text-white font-semibold">
              Return to {pendingGame.type === 'game' ? 'Game' : 'Lobby'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

PendingGameBanner.displayName = 'PendingGameBanner';
