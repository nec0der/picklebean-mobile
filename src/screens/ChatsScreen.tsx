/**
 * ChatsScreen - Main chat list screen with Telegram-style search
 * Header + New Chat button in header, animated search overlay
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { MessageCircle, Plus, Search } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useChats, filterChats } from '@/hooks/firestore/useChats';
import { useRecentSearches } from '@/hooks/common/useRecentSearches';
import { markChatAsDeleted } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { ChatSearchOverlay } from '@/components/chat/ChatSearchOverlay';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { isGravity } from '@/config/product';
import { FLOATING_TAB_BAR_HEIGHT } from '@/navigation/tabs/GravityTabNavigator';
import type { ChatListItem as ChatListItemType, RecentSearch } from '@/types/chat';
import type { UserSearchResult } from '@/services/userService';
import { getOrCreateIndividualChat } from '@/services/chatService';

const HEADER_HEIGHT = 56;
const CONTENT_BOTTOM_PADDING = isGravity ? FLOATING_TAB_BAR_HEIGHT : 0;
const ANIMATION_DURATION = 300;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ChatsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { userDocument } = useAuth();
  const { chats, loading, error, totalUnread } = useChats();
  const {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  } = useRecentSearches();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation shared value
  const searchAnimationProgress = useSharedValue(0);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    return filterChats(chats, searchQuery);
  }, [chats, searchQuery]);

  // Enter search mode
  const handleEnterSearchMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchMode(true);
    searchAnimationProgress.value = withTiming(1, { duration: ANIMATION_DURATION });
  }, [searchAnimationProgress]);

  // Exit search mode
  const handleExitSearchMode = useCallback(() => {
    searchAnimationProgress.value = withTiming(0, { duration: ANIMATION_DURATION });
    setTimeout(() => {
      setIsSearchMode(false);
      setSearchQuery('');
    }, ANIMATION_DURATION);
  }, [searchAnimationProgress]);

  // Animated header style (slides up when search mode)
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            searchAnimationProgress.value,
            [0, 1],
            [0, -(HEADER_HEIGHT + insets.top)],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        searchAnimationProgress.value,
        [0, 0.5],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  // Navigate to chat detail
  const handleChatPress = useCallback(
    (chatId: string) => {
      // Add to recent searches
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        addSearch({
          id: chat.id,
          type: 'chat',
          displayName: chat.displayName,
          photoURL: chat.displayPhotoURL,
        });
      }

      // Exit search mode if active
      if (isSearchMode) {
        handleExitSearchMode();
      }

      // Build recipientUser for individual chats to avoid loading flash
      let recipientUser = undefined;
      if (chat && chat.type === 'individual' && userDocument?.uid) {
        // Find the other participant's info
        const otherUserId = chat.participantIds.find((id: string) => id !== userDocument.uid);
        if (otherUserId && chat.participantInfo[otherUserId]) {
          const otherUser = chat.participantInfo[otherUserId];
          recipientUser = {
            uid: otherUserId,
            username: otherUser.username || '',
            displayName: otherUser.displayName,
            photoURL: otherUser.photoURL || null,
          };
        }
      }

      navigation.navigate('ChatDetail', { chatId, recipientUser });
    },
    [chats, addSearch, isSearchMode, handleExitSearchMode, navigation, userDocument?.uid]
  );

  // Handle recent search selection
  const handleSelectRecentSearch = useCallback(
    (search: RecentSearch) => {
      if (search.type === 'chat') {
        handleExitSearchMode();
        navigation.navigate('ChatDetail', { chatId: search.id });
      } else if (search.type === 'user') {
        // User type - open draft chat mode
        // search.id is the user's uid, username is stored separately
        navigation.navigate('ChatDetail', {
          recipientUser: {
            uid: search.id,
            username: search.username || '',
            displayName: search.displayName,
            photoURL: search.photoURL || null,
          },
        });
      }
    },
    [handleExitSearchMode, navigation]
  );

  // Handle selecting a user from global search (open draft chat)
  const handleSelectUser = useCallback(
    (user: UserSearchResult) => {
      // Add to recent searches for easy re-access
      addSearch({
        id: user.uid,
        type: 'user',
        displayName: user.displayName,
        photoURL: user.photoURL,
        username: user.username,
      });

      // Don't close search mode - user can go back to the overlay from draft chat
      // Navigate with recipientUser (draft mode - chat created on first message)
      navigation.navigate('ChatDetail', {
        recipientUser: {
          uid: user.uid,
          username: user.username,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      });
    },
    [addSearch, navigation]
  );

  // Handle new chat button - navigate to NewChat screen
  const handleNewChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('NewChat');
  }, [navigation]);

  // Swipe action - Mark as deleted
  const handleMarkAsDeleted = useCallback(
    async (chatId: string) => {
      if (!userDocument?.uid) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      Alert.alert(
        'Delete Chat',
        'This will hide the chat from your list. It will reappear if you receive a new message.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await markChatAsDeleted(chatId, userDocument.uid);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (err) {
                console.error('Error deleting chat:', err);
                Alert.alert('Error', 'Failed to delete chat');
              }
            },
          },
        ]
      );
    },
    [userDocument?.uid]
  );

  // Render swipe actions
  const renderRightActions = useCallback(
    (chatId: string) => {
      return (
        <Pressable
          onPress={() => handleMarkAsDeleted(chatId)}
          className="items-center justify-center w-20 bg-red-500"
        >
          <Text className="text-sm font-semibold !text-white">Delete</Text>
        </Pressable>
      );
    },
    [handleMarkAsDeleted]
  );

  // Render chat item with swipe
  const renderChatItem = useCallback(
    ({ item }: { item: ChatListItemType }) => {
      return (
        <Swipeable renderRightActions={() => renderRightActions(item.id)}>
          <ChatListItem chat={item} onPress={handleChatPress} />
        </Swipeable>
      );
    },
    [handleChatPress, renderRightActions]
  );

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // The useChats hook auto-refreshes via real-time subscription
    // This is just for pull-to-refresh feedback
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Empty state
  const EmptyState = useCallback(
    () => (
      <View className="items-center justify-center flex-1 px-8 py-20">
        <View className="items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
          <MessageCircle size={40} color="#9CA3AF" />
        </View>
        <Text className="mb-2 text-xl font-semibold text-gray-900">No Chats Yet</Text>
        <Text className="text-base text-center text-gray-500">
          Start a conversation by tapping the + button
        </Text>
      </View>
    ),
    []
  );

  if (loading && !refreshing) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {/* Animated Header */}
        <Animated.View
          style={headerAnimatedStyle}
          className="flex-row items-center justify-between px-4"
        >
          <View style={{ height: HEADER_HEIGHT, justifyContent: 'center' }}>
            <Text className="text-3xl font-bold text-gray-900">Chats</Text>
          </View>
          
          {/* New Chat Button (in header) */}
          <Pressable
            onPress={handleNewChat}
            className="items-center justify-center w-10 h-10 bg-blue-500 rounded-full"
          >
            <Plus size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        {/* Search Bar Trigger (tappable) - matches overlay style */}
        <Animated.View style={headerAnimatedStyle} className="px-4 py-2">
          <Pressable
            onPress={handleEnterSearchMode}
            className="flex-row items-center px-4 bg-gray-100 rounded-full"
            style={{ height: 44 }}
          >
            <Search size={20} color="#9CA3AF" />
            <Text className="flex-1 ml-3 text-xl text-gray-400">Search</Text>
          </Pressable>
        </Animated.View>

        {/* Chat List */}
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: CONTENT_BOTTOM_PADDING }}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ItemSeparatorComponent={() => (
            <View className="h-px ml-16 bg-gray-100" />
          )}
        />

        {/* Search Overlay (animated) */}
        <ChatSearchOverlay
          isVisible={isSearchMode}
          animationProgress={searchAnimationProgress}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          recentSearches={recentSearches}
          searchResults={filteredChats}
          onSelectRecentSearch={handleSelectRecentSearch}
          onSelectResult={handleChatPress}
          onSelectUser={handleSelectUser}
          onClearSearches={clearSearches}
          onClose={handleExitSearchMode}
        />
      </View>
    </GestureHandlerRootView>
  );
};
