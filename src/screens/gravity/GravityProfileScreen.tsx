/**
 * GravityProfileScreen - WhatsApp/Instagram inspired profile for Gravity
 * Features: Left-aligned avatar, following/followers, infinite scroll placeholder
 */

import { memo, useCallback, useState } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Settings, Camera } from 'lucide-react-native';
import type { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Avatar } from '@/components/ui/Avatar';
import { FLOATING_TAB_BAR_HEIGHT } from '@/navigation/tabs/GravityTabNavigator';

const HEADER_HEIGHT = 56;

export const GravityProfileScreen = memo(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { userDocument, firebaseUser, loading: authLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Get profile data
  const profilePicture = userDocument?.profilePictureUrl || firebaseUser?.photoURL || null;
  const displayName = userDocument?.displayName || firebaseUser?.displayName || 'User';
  const username = userDocument?.username || 'user';
  const bio = userDocument?.bio;
  const followingCount = userDocument?.followingCount || 0;
  const followersCount = userDocument?.followersCount || 0;

  // Navigation handlers
  const handleSettings = useCallback(() => {
    // TODO: Navigate to GravitySettings once added to navigation
    navigation.navigate('Settings');
  }, [navigation]);

  const handleFollowingPress = useCallback(() => {
    if (userDocument?.uid) {
      navigation.navigate('FollowList', {
        userId: userDocument.uid,
        initialTab: 'following',
      });
    }
  }, [navigation, userDocument?.uid]);

  const handleFollowersPress = useCallback(() => {
    if (userDocument?.uid) {
      navigation.navigate('FollowList', {
        userId: userDocument.uid,
        initialTab: 'followers',
      });
    }
  }, [navigation, userDocument?.uid]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Profile header content - Instagram centered style
  const renderHeader = useCallback(() => (
    <View className="px-4 pt-6 pb-6 bg-white">
      {/* Centered Avatar */}
      <View className="items-center mb-4">
        <Avatar
          uri={profilePicture}
          name={displayName}
          size="xl"
        />
      </View>

      {/* Centered Name, Username, Bio */}
      <View className="items-center mb-6">
        <Text className="text-xl font-bold text-gray-900">{displayName}</Text>
        <Text className="text-base text-gray-500">@{username}</Text>
        {bio && (
          <Text className="px-8 mt-2 text-base text-center text-gray-700" numberOfLines={3}>
            {bio}
          </Text>
        )}
      </View>

      {/* Following / Followers Stats */}
      <View className="flex-row">
        <Pressable
          onPress={handleFollowingPress}
          className="flex-1 py-3 mr-2 bg-gray-50 rounded-xl active:bg-gray-100"
        >
          <Text className="text-2xl font-bold text-center text-gray-900">
            {followingCount}
          </Text>
          <Text className="text-sm text-center text-gray-500">Following</Text>
        </Pressable>

        <Pressable
          onPress={handleFollowersPress}
          className="flex-1 py-3 ml-2 bg-gray-50 rounded-xl active:bg-gray-100"
        >
          <Text className="text-2xl font-bold text-center text-gray-900">
            {followersCount}
          </Text>
          <Text className="text-sm text-center text-gray-500">Followers</Text>
        </Pressable>
      </View>
    </View>
  ), [
    profilePicture,
    displayName,
    username,
    bio,
    followingCount,
    followersCount,
    handleFollowingPress,
    handleFollowersPress,
  ]);

  // Empty state for activity feed
  const renderEmptyState = useCallback(() => (
    <View className="items-center justify-center flex-1 px-8 py-16">
      {/* <View className="items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
        <Camera size={36} color="#9CA3AF" />
      </View> */}
      <Text className="mb-2 text-lg font-semibold text-gray-900">
        No activity yet
      </Text>
      <Text className="text-base text-center text-gray-500">
        Your recent activity will appear here
      </Text>
    </View>
  ), []);

  if (authLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4"
        style={{ height: HEADER_HEIGHT }}
      >
        <Text className="text-3xl font-bold text-gray-900">Profile</Text>
        <Pressable onPress={handleSettings} className="p-2 -mr-2 active:opacity-70">
          <Settings size={24} color="#6B7280" />
        </Pressable>
      </View>

      {/* Content with infinite scroll placeholder */}
      <FlatList
        data={[]} // Empty for now - future activity feed
        keyExtractor={(item, index) => `activity-${index}`}
        renderItem={() => null}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: FLOATING_TAB_BAR_HEIGHT,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
});

GravityProfileScreen.displayName = 'GravityProfileScreen';
