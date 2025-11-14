import { memo } from 'react';
import { View, Text } from 'react-native';
import type { TabScreenProps } from '@/types/navigation';

export const LeaderboardScreen = memo(({}: TabScreenProps<'Leaderboard'>) => {
  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <View className="items-center">
        <Text className="text-3xl font-bold text-primary-600 mb-3">
          Leaderboard
        </Text>
        <Text className="text-base text-secondary-600 text-center mb-4">
          See how you rank against other players in your area and globally.
        </Text>
        <Text className="text-sm text-secondary-400 text-center">
          Coming soon: Rankings by region, skill level filters, and player search.
        </Text>
      </View>
    </View>
  );
});

LeaderboardScreen.displayName = 'LeaderboardScreen';
