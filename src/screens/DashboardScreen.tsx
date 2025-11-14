import { memo } from 'react';
import { View, Text } from 'react-native';
import type { TabScreenProps } from '@/types/navigation';

export const DashboardScreen = memo(({}: TabScreenProps<'Dashboard'>) => {
  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <View className="items-center">
        <Text className="text-3xl font-bold text-primary-600 mb-3">
          Dashboard
        </Text>
        <Text className="text-base text-secondary-600 text-center mb-4">
          Your home for quick stats, recent matches, and personalized insights.
        </Text>
        <Text className="text-sm text-secondary-400 text-center">
          Coming soon: Match history preview, current rank, and quick actions.
        </Text>
      </View>
    </View>
  );
});

DashboardScreen.displayName = 'DashboardScreen';
