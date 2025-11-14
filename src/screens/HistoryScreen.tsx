import { memo } from 'react';
import { View, Text } from 'react-native';
import type { TabScreenProps } from '@/types/navigation';

export const HistoryScreen = memo(({}: TabScreenProps<'History'>) => {
  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <View className="items-center">
        <Text className="text-3xl font-bold text-primary-600 mb-3">
          Match History
        </Text>
        <Text className="text-base text-secondary-600 text-center mb-4">
          Review your past matches, analyze your performance, and track your progress.
        </Text>
        <Text className="text-sm text-secondary-400 text-center">
          Coming soon: Complete match history, detailed stats, and performance charts.
        </Text>
      </View>
    </View>
  );
});

HistoryScreen.displayName = 'HistoryScreen';
