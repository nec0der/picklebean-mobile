import { memo, useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
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

type Route = {
  key: 'following' | 'followers';
  title: string;
};

export const FollowListScreen = memo(({ route, navigation }: RootStackScreenProps<'FollowList'>) => {
  const { userId, initialTab = 'following' } = route.params;
  const { userDocument } = useAuth();
  const layout = useWindowDimensions();
  
  // TabView state
  const [index, setIndex] = useState(initialTab === 'following' ? 0 : 1);
  const [routes] = useState<Route[]>([
    { key: 'following', title: 'Following' },
    { key: 'followers', title: 'Followers' },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current active tab
  const activeTab: Tab = routes[index].key;

  // Fetch following and followers lists
  const { users: followingUsers, loading: followingLoading } = useFollowing(userId, userDocument?.uid);
  const { users: followersUsers, loading: followersLoading } = useFollowers(userId, userDocument?.uid);

  // Determine which list to show and loading state
  const users = activeTab === 'following' ? followingUsers : followersUsers;
  const loading = activeTab === 'following' ? followingLoading : followersLoading;
  
  // Clear search when switching tabs
  const handleIndexChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
    setSearchQuery(''); // Clear search on tab switch
  }, []);

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

  const renderEmpty = useCallback((tabKey: Tab) => {
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
            {tabKey === 'following' 
              ? "You're not following anyone yet"
              : "No followers yet"
            }
          </Text>
          <Text className="text-sm text-center !text-gray-500">
            {tabKey === 'following'
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
          No {tabKey}
        </Text>
        <Text className="text-sm text-center !text-gray-500">
          This user has no {tabKey} yet
        </Text>
      </View>
    );
  }, [userId, userDocument?.uid, searchQuery]);

  // Render tab content - uses route.key to determine which tab to show
  const renderScene = useCallback(({ route: sceneRoute }: { route: Route }) => {
    // Get data for THIS specific tab (not the active one)
    const tabKey = sceneRoute.key;
    const tabUsers = tabKey === 'following' ? followingUsers : followersUsers;
    const tabLoading = tabKey === 'following' ? followingLoading : followersLoading;
    
    // Filter users for this specific tab (inline, no useMemo to avoid Hooks violation)
    const filteredTabUsers = !searchQuery.trim() 
      ? tabUsers 
      : tabUsers.filter((u: FollowUser) => 
          u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
      <View className="flex-1">
        {/* Search Bar */}
        {!tabLoading && tabUsers.length > 0 && (
          <View className="px-4 py-3 bg-white border-b border-gray-100">
            <Input variant="rounded" size="md" className="bg-gray-100 border-0">
              <InputSlot className="pl-3">
                <InputIcon as={Search} className="text-gray-500" />
              </InputSlot>
              <InputField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`Search ${tabKey}...`}
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
        {tabLoading ? (
          <View className="items-center justify-center flex-1">
            <LoadingSpinner />
          </View>
        ) : (
          <FlatList
            data={filteredTabUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.uid}
            ListEmptyComponent={() => renderEmpty(tabKey)}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              console.log('Load more users');
            }}
          />
        )}
      </View>
    );
  }, [followingUsers, followersUsers, followingLoading, followersLoading, searchQuery, handleClearSearch, renderUser, renderEmpty]);

  // Custom tab bar
  const renderTabBar = useCallback((props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#16A34A', height: 2 }}
      style={{ backgroundColor: 'white', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
      labelStyle={{ fontWeight: '600', textTransform: 'none', fontSize: 16 }}
      activeColor="#16A34A"
      inactiveColor="#6B7280"
    />
  ), []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader title="Following & Followers" onLeftPress={handleBack} />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </SafeAreaView>
  );
});

FollowListScreen.displayName = 'FollowListScreen';
