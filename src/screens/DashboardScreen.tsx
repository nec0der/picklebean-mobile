import { memo, useEffect } from 'react';
import { View, Text } from 'react-native';
import type { TabScreenProps } from '@/types/navigation';
import { useToast } from '@/hooks/common/useToast';

export const DashboardScreen = memo(({}: TabScreenProps<'Dashboard'>) => {
  const toast = useToast();

  // Show welcome toast on mount
  useEffect(() => {
    toast.success('Welcome to Picklebean! 🎾');
  }, []);

  return (
    <View className="items-center justify-center flex-1 px-4 bg-white">
      <View className="items-center">
        <Text className="mb-3 text-3xl font-bold text-primary-600">
          Dashboard
        </Text>
        <Text className="mb-4 text-base text-center text-secondary-600">
          Your home for quick stats, recent matches, and personalized insights.
        </Text>
        <Text className="text-sm text-center text-secondary-400">
          Coming soon: Match history preview, current rank, and quick actions.
        </Text>
      </View>
    </View>
  );
});

DashboardScreen.displayName = 'DashboardScreen';
