import { memo } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Lock, Bell, Shield, LogOut, Trash2, Zap } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const SettingsScreen = memo(({ navigation }: RootStackScreenProps<'Settings'>) => {
  const { signOut } = useAuth();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const handleChangePassword = () => {
    // TODO: Navigate to change password
    Alert.alert('Change Password', 'Password change coming soon!');
  };

  const handleNotifications = () => {
    // TODO: Navigate to notification settings
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const handlePrivacy = () => {
    // TODO: Navigate to privacy settings
    Alert.alert('Privacy', 'Privacy settings coming soon!');
  };

  const handleProgramPaddle = () => {
    navigation.navigate('ProgramPaddle');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <Pressable onPress={handleBack} className="mr-3 active:opacity-70">
          <ArrowLeft size={24} color="#000" />
        </Pressable>
        <Text className="text-xl font-semibold !text-gray-900">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Account Section */}
        <View className="py-2">
          <Text className="px-4 py-2 text-xs font-semibold !text-gray-500 uppercase">
            Account
          </Text>

          <SettingsItem
            icon={<User size={20} color="#6B7280" />}
            title="Edit Profile"
            onPress={handleEditProfile}
          />

          <SettingsItem
            icon={<Lock size={20} color="#6B7280" />}
            title="Change Password"
            onPress={handleChangePassword}
          />
        </View>

        {/* Device Section */}
        <View className="py-2">
          <Text className="px-4 py-2 text-xs font-semibold !text-gray-500 uppercase">
            Device
          </Text>

          <SettingsItem
            icon={<Zap size={20} color="#6B7280" />}
            title="Tap to Play"
            onPress={handleProgramPaddle}
          />
        </View>

        {/* Preferences Section */}
        <View className="py-2">
          <Text className="px-4 py-2 text-xs font-semibold !text-gray-500 uppercase">
            Preferences
          </Text>

          <SettingsItem
            icon={<Bell size={20} color="#6B7280" />}
            title="Notifications"
            onPress={handleNotifications}
          />

          <SettingsItem
            icon={<Shield size={20} color="#6B7280" />}
            title="Privacy"
            onPress={handlePrivacy}
          />
        </View>

        {/* Actions Section */}
        <View className="py-2">
          <Text className="px-4 py-2 text-xs font-semibold !text-gray-500 uppercase">
            Actions
          </Text>

          <SettingsItem
            icon={<LogOut size={20} color="#EF4444" />}
            title="Sign Out"
            titleColor="!text-red-600"
            onPress={handleSignOut}
          />

          <SettingsItem
            icon={<Trash2 size={20} color="#EF4444" />}
            title="Delete Account"
            titleColor="!text-red-600"
            onPress={handleDeleteAccount}
          />
        </View>

        {/* App Version */}
        <View className="items-center py-8">
          <Text className="text-sm !text-gray-400">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

SettingsScreen.displayName = 'SettingsScreen';

// Settings Item Component
interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  titleColor?: string;
  onPress: () => void;
}

const SettingsItem = memo(({ icon, title, titleColor, onPress }: SettingsItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 border-b border-gray-100 active:bg-gray-50"
    >
      <View className="mr-3">{icon}</View>
      <Text className={`flex-1 text-base ${titleColor || '!text-gray-900'}`}>
        {title}
      </Text>
    </Pressable>
  );
});

SettingsItem.displayName = 'SettingsItem';
