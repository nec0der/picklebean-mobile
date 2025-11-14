import { memo } from 'react';
import { View, Text } from 'react-native';
import type { TabScreenProps } from '@/types/navigation';

export const PlayScreen = memo(({}: TabScreenProps<'Play'>) => {
  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <View className="items-center">
        <View className="w-20 h-20 bg-green-500 rounded-full justify-center items-center mb-4">
          <Text className="text-4xl text-white">+</Text>
        </View>
        <Text className="text-3xl font-bold text-green-600 mb-3">
          Start Playing
        </Text>
        <Text className="text-base text-secondary-600 text-center mb-4">
          Create or join a match to track your games and update your ranking.
        </Text>
        <Text className="text-sm text-secondary-400 text-center">
          Coming soon: Quick match, create lobby, join by code, and match settings.
        </Text>
      </View>
    </View>
  );
});

PlayScreen.displayName = 'PlayScreen';
