import { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { PendingGame } from '@/hooks/firestore/usePendingGame';
import { ArrowRight } from 'lucide-react-native';

interface PendingGameBannerProps {
  pendingGame: PendingGame;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PendingGameBanner = memo(({ pendingGame }: PendingGameBannerProps) => {
  const navigation = useNavigation<NavigationProp>();

  const handleReturn = useCallback(() => {
    // Smart navigation: Go to Game if active, Lobby if waiting
    if (pendingGame.type === 'game') {
      navigation.navigate('Game', { roomCode: pendingGame.roomCode });
    } else {
      navigation.navigate('LobbyDetail', { roomCode: pendingGame.roomCode });
    }
  }, [navigation, pendingGame.type, pendingGame.roomCode]);

  return (
    <View className="p-4 mx-4 mt-4 mb-2 shadow-lg bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-white/20">
          <Text className="text-2xl">🎾</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold !text-white">
            {pendingGame.type === 'game' ? 'Game in Progress' : 'Lobby Waiting'}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-sm !text-white/80">
              Room: {pendingGame.roomCode}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Resume Button */}
      <Pressable 
        onPress={handleReturn}
        className="py-3 bg-white rounded-lg active:bg-gray-100"
      >
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-base font-semibold !text-green-600">
            {pendingGame.type === 'game' ? 'Resume Game' : 'Go to Lobby'}
          </Text>
          <ArrowRight size={20} color="#16a34a" />
        </View>
      </Pressable>
    </View>
  );
});

PendingGameBanner.displayName = 'PendingGameBanner';
