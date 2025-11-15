/**
 * DevBanner Component
 * Displays a visual indicator showing which Firebase environment is active
 * Only shows in non-production environments to avoid confusion
 */

import { memo } from 'react';
import { View, Text } from 'react-native';
import { ENV, IS_PROD } from '@/config/firebase';

export const DevBanner = memo(() => {
  // Don't show banner in production
  if (IS_PROD) {
    return null;
  }

  return (
    <View className="bg-yellow-400 py-1">
      <Text className="text-center text-black font-bold text-xs">
        🚧 {ENV.toUpperCase()} ENVIRONMENT 🚧
      </Text>
    </View>
  );
});

DevBanner.displayName = 'DevBanner';
