/**
 * GravitySettingsScreen - iOS/WhatsApp inspired grouped settings
 * Features: Rounded grouped sections, chevrons, clean visual hierarchy
 */

import { memo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  Bell,
  Shield,
  Zap,
  HelpCircle,
  FileText,
  ShieldCheck,
  LogOut,
} from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const GravitySettingsScreen = memo(
  ({ navigation }: RootStackScreenProps<'Settings'>) => {
    const insets = useSafeAreaInsets();
    const { signOut, firebaseUser } = useAuth();

    // Check if user has password auth (not OAuth)
    const hasPasswordAuth = firebaseUser?.providerData.some(
      (provider) => provider.providerId === 'password'
    );

    // Navigation handlers
    const handleBack = useCallback(() => {
      navigation.goBack();
    }, [navigation]);

    const handleEditProfile = useCallback(() => {
      navigation.navigate('EditProfile');
    }, [navigation]);

    const handleChangePassword = useCallback(() => {
      if (hasPasswordAuth) {
        navigation.navigate('ChangePassword');
      } else {
        Alert.alert(
          'Not Available',
          "You signed in with Google/Apple. Use their password reset if you need to change your password."
        );
      }
    }, [hasPasswordAuth, navigation]);

    const handleTapToPlay = useCallback(() => {
      navigation.navigate('ProgramPaddle');
    }, [navigation]);

    const handleNotifications = useCallback(() => {
      Alert.alert('Notifications', 'Notification settings coming soon!');
    }, []);

    const handlePrivacy = useCallback(() => {
      Alert.alert('Privacy', 'Privacy settings coming soon!');
    }, []);

    const handleHelp = useCallback(() => {
      Alert.alert('Help', 'Help & support coming soon!');
    }, []);

    const handleTerms = useCallback(() => {
      Alert.alert('Terms of Service', 'Terms of service coming soon!');
    }, []);

    const handlePrivacyPolicy = useCallback(() => {
      Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
    }, []);

    const handleSignOut = useCallback(() => {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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
      ]);
    }, [signOut]);

    return (
      <View className="flex-1 bg-gray-100" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 bg-gray-100">
          <Pressable
            onPress={handleBack}
            className="flex-row items-center -ml-2 active:opacity-70"
          >
            <ChevronLeft size={28} color="#3B82F6" />
            <Text className="text-lg !text-blue-500">Back</Text>
          </Pressable>
          <Text className="flex-1 text-xl font-semibold text-center text-gray-900">
            Settings
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Account Section */}
          <View className="px-4 pt-6 pb-2">
            <SettingsGroup>
              <SettingsItem
                icon={<User size={20} color="#6B7280" />}
                title="Edit Profile"
                onPress={handleEditProfile}
              />
              {hasPasswordAuth && (
                <SettingsItem
                  icon={<Lock size={20} color="#6B7280" />}
                  title="Change Password"
                  onPress={handleChangePassword}
                  showSeparator
                />
              )}
              <SettingsItem
                icon={<Zap size={20} color="#6B7280" />}
                title="Tap to Play"
                onPress={handleTapToPlay}
                showSeparator
              />
            </SettingsGroup>
          </View>

          {/* Preferences Section */}
          <View className="px-4 pt-4 pb-2">
            <SettingsGroup>
              <SettingsItem
                icon={<Bell size={20} color="#6B7280" />}
                title="Notifications"
                onPress={handleNotifications}
              />
              <SettingsItem
                icon={<Shield size={20} color="#6B7280" />}
                title="Privacy"
                onPress={handlePrivacy}
                showSeparator
              />
            </SettingsGroup>
          </View>

          {/* Support Section */}
          <View className="px-4 pt-4 pb-2">
            <SettingsGroup>
              <SettingsItem
                icon={<HelpCircle size={20} color="#6B7280" />}
                title="Help"
                onPress={handleHelp}
              />
              <SettingsItem
                icon={<FileText size={20} color="#6B7280" />}
                title="Terms of Service"
                onPress={handleTerms}
                showSeparator
              />
              <SettingsItem
                icon={<ShieldCheck size={20} color="#6B7280" />}
                title="Privacy Policy"
                onPress={handlePrivacyPolicy}
                showSeparator
              />
            </SettingsGroup>
          </View>

          {/* Sign Out Section */}
          <View className="px-4 pt-4 pb-2">
            <SettingsGroup>
              <Pressable
                onPress={handleSignOut}
                className="flex-row items-center justify-center py-4 active:bg-gray-50"
              >
                <LogOut size={20} color="#EF4444" />
                <Text className="ml-3 text-base font-medium !text-red-500">
                  Sign Out
                </Text>
              </Pressable>
            </SettingsGroup>
          </View>

          {/* Version */}
          <View className="items-center py-6">
            <Text className="text-sm text-gray-400">Version 1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
);

GravitySettingsScreen.displayName = 'GravitySettingsScreen';

// Grouped container for iOS style
interface SettingsGroupProps {
  children: React.ReactNode;
}

const SettingsGroup = memo(({ children }: SettingsGroupProps) => {
  return (
    <View className="overflow-hidden bg-white rounded-xl">
      {children}
    </View>
  );
});

SettingsGroup.displayName = 'SettingsGroup';

// Settings item with chevron
interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  showSeparator?: boolean;
}

const SettingsItem = memo(
  ({ icon, title, onPress, showSeparator = false }: SettingsItemProps) => {
    return (
      <>
        {showSeparator && <View className="h-px bg-gray-200 ml-14" />}
        <Pressable
          onPress={onPress}
          className="flex-row items-center px-4 py-3 active:bg-gray-50"
        >
          <View className="mr-3">{icon}</View>
          <Text className="flex-1 text-base text-gray-900">{title}</Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </>
    );
  }
);

SettingsItem.displayName = 'SettingsItem';
