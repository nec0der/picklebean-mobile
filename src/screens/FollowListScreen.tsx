import { memo, useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, InputField, InputSlot, InputIcon } from '@gluestack-ui/themed';
import { Search, X } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowing, useFollowers, type FollowUser } from '@/hooks/firestore/useFollowLists';
import { useFollow } from '@/hooks/actions/useFollow';
import { ScreenHeader } from '@/components/common';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type Tab = 'following' | 'followers';

export const FollowListScreen = memo(({ route, navigation }: RootStackScreenProps<'FollowList'>) => {
  const { userId, initialTab = 'following' } = route.params;
  const { userDocument } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Clear search when switching tabs
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setSearchQuery(''); // Clear search on tab switch
  }, []);

  // Fetch following and followers lists
  const { users: followingUsers, loading: followingLoading } = useFollowing(userId, userDocument?.uid);
  const { users: followersUsers, loading: followersLoading } = useFollowers(userId, userDocument?.uid);

  // Determine which list to show and loading state
  const users = activeTab === 'following' ? followingUsers : followersUsers;
  const loading = activeTab === 'following' ? followingLoading : followersLoading;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleUserPress = useCallback((username: string) => {
    navigation.navigate('UserProfile', { username });
  }, [navigation]);

  const handleFollowToggle = useCallback((userId: string, isFollowing: boolean) => {
    // TODO: Implement follow/unfollow
    console.log('Toggle follow for:', userId, isFollowing);
  }, []);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter((u: FollowUser) => 
      u.displayName.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const renderUser = useCallback(({ item }: { item: FollowUser }) => (
    <Pressable
      onPress={() => handleUserPress(item.username)}
      className="flex-row items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
    >
      {/* Left: Avatar + Names */}
      <Avatar uri={item.profilePictureUrl || null} name={item.displayName} size="md" />
      
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold !text-gray-900">
          {item.displayName}
        </Text>
        <Text className="text-sm !text-gray-600">
          @{item.username}
        </Text>
      </View>

      {/* Right: Follow/Unfollow Button */}
      {item.uid !== userDocument?.uid && (
        <Pressable
          onPress={() => handleFollowToggle(item.uid, item.isFollowing)}
          className={`px-4 py-2 rounded-lg ${
            item.isFollowing
              ? 'bg-gray-200 active:bg-gray-300'
              : 'bg-green-600 active:bg-green-700'
          }`}
        >
          <Text className={`font-semibold ${
            item.isFollowing ? '!text-gray-700' : '!text-white'
          }`}>
            {item.isFollowing ? 'Unfollow' : 'Follow'}
          </Text>
        </Pressable>
      )}
    </Pressable>
  ), [userDocument?.uid, handleUserPress, handleFollowToggle]);

  const renderEmpty = () => {
    const isOwnProfile = userId === userDocument?.uid;
    
    // When searching
    if (searchQuery) {
      return (
        <View className="items-center justify-center py-16">
          <Text className="mb-2 text-lg font-bold !text-gray-900">
            No users found
          </Text>
          <Text className="text-sm text-center !text-gray-500">
            Try a different search term
          </Text>
        </View>
      );
    }
    
    // For own profile - friendly messages
    if (isOwnProfile) {
      return (
        <View className="items-center justify-center px-8 py-16">
          <Text className="mb-2 text-lg font-bold !text-gray-900">
            {activeTab === 'following' 
              ? "You're not following anyone yet"
              : "No followers yet"
            }
          </Text>
          <Text className="text-sm text-center !text-gray-500">
            {activeTab === 'following'
              ? 'Start following other players to see their activity!'
              : 'Share your profile to gain followers!'
            }
          </Text>
        </View>
      );
    }
    
    // For other users' profiles
    return (
      <View className="items-center justify-center py-16">
        <Text className="mb-2 text-lg font-bold !text-gray-900">
          No {activeTab}
        </Text>
        <Text className="text-sm text-center !text-gray-500">
          This user has no {activeTab} yet
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="Following & Followers"
        onLeftPress={handleBack}
      />

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200">
        <Pressable
          onPress={() => handleTabChange('following')}
          className={`flex-1 py-3 ${
            activeTab === 'following' ? 'border-b-2 border-green-600' : ''
          }`}
        >
          <Text className={`text-center font-semibold ${
            activeTab === 'following' ? '!text-green-600' : '!text-gray-600'
          }`}>
            Following
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('followers')}
          className={`flex-1 py-3 ${
            activeTab === 'followers' ? 'border-b-2 border-green-600' : ''
          }`}
        >
          <Text className={`text-center font-semibold ${
            activeTab === 'followers' ? '!text-green-600' : '!text-gray-600'
          }`}>
            Followers
          </Text>
        </Pressable>
      </View>

      {/* Search Bar - Outside FlatList to prevent keyboard dismissal */}
      {!loading && users.length > 0 && (
        <View className="px-4 py-3 bg-white border-b border-gray-100">
          <Input 
            variant="rounded" 
            size="md" 
            className="bg-gray-100 border-0"
          >
            <InputSlot className="pl-3">
              <InputIcon as={Search} className="text-gray-500" />
            </InputSlot>
            <InputField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <InputSlot className="pr-3">
                <Pressable onPress={handleClearSearch}>
                  <InputIcon as={X} className="text-gray-500" />
                </Pressable>
              </InputSlot>
            )}
          </Input>
        </View>
      )}

      {/* User List */}
      {loading ? (
        <View className="items-center justify-center flex-1">
          <LoadingSpinner />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.uid}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            // TODO: Load more users for infinite scroll
            console.log('Load more users');
          }}
        />
      )}
    </SafeAreaView>
  );
});

FollowListScreen.displayName = 'FollowListScreen';
