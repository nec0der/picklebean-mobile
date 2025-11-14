import { memo } from 'react';
import { View, Text } from 'react-native';
import type { TabScreenProps } from '@/types/navigation';

export const ProfileScreen = memo(({}: TabScreenProps<'Profile'>) => {
  return (
    <View className="flex-1 bg-white justify-center items-center px-4">
      <View className="items-center">
        <Text className="text-3xl font-bold text-primary-600 mb-3">
          Profile
        </Text>
        <Text className="text-base text-secondary-600 text-center mb-4">
          Manage your account, view your stats, and customize your preferences.
        </Text>
        <Text className="text-sm text-secondary-400 text-center">
          Coming soon: Profile editing, achievement badges, and settings.
        </Text>
      </View>
    </View>
  );
});

ProfileScreen.displayName = 'ProfileScreen';
