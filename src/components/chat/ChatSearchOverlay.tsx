/**
 * ChatSearchOverlay - Full screen search mode overlay
 * Telegram-style with CHATS and GLOBAL SEARCH sections
 */

import { memo, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, InputField, InputSlot } from '@gluestack-ui/themed';
import { Search, X } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useSearchUsers } from '@/hooks/firestore/useSearchUsers';
import { Avatar } from '@/components/ui/Avatar';
import type { RecentSearch, ChatListItem } from '@/types/chat';
import type { UserSearchResult } from '@/services/userService';

interface ChatSearchOverlayProps {
  isVisible: boolean;
  animationProgress: SharedValue<number>;
  searchQuery: string;
  onSearchQueryChange: (text: string) => void;
  recentSearches: RecentSearch[];
  searchResults: ChatListItem[];
  onSelectRecentSearch: (search: RecentSearch) => void;
  onSelectResult: (chatId: string) => void;
  onSelectUser: (user: UserSearchResult) => void;
  onClearSearches: () => void;
  onClose: () => void;
}


export const ChatSearchOverlay = memo(
  ({
    isVisible,
    animationProgress,
    searchQuery,
    onSearchQueryChange,
    recentSearches,
    searchResults,
    onSelectRecentSearch,
    onSelectResult,
    onSelectUser,
    onClearSearches,
    onClose,
  }: ChatSearchOverlayProps) => {
    const insets = useSafeAreaInsets();
    const inputRef = useRef<any>(null);

    // Global user search
    const { results: globalUsers, loading: globalLoading, search: searchGlobal } = useSearchUsers();

    // Trigger global search when query changes
    useEffect(() => {
      searchGlobal(searchQuery);
    }, [searchQuery, searchGlobal]);

    // Focus input when overlay becomes visible
    useEffect(() => {
      if (isVisible) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }
    }, [isVisible]);

    // Handle close with animation
    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    }, [onClose]);

    // Animated styles for overlay
    const overlayStyle = useAnimatedStyle(() => {
      return {
        opacity: animationProgress.value,
        transform: [
          {
            translateY: interpolate(
              animationProgress.value,
              [0, 1],
              [20, 0],
              Extrapolation.CLAMP
            ),
          },
        ],
      };
    });

    // Check for valid search query
    const hasSearchQuery = searchQuery.trim().length > 0;
    const hasMinQueryLength = searchQuery.trim().length >= 2;

    // Filter global search to exclude users already in CHATS section
    // Extract user IDs from existing chats' participantIds
    const filteredGlobalUsers = useMemo(() => {
      // Get all user IDs from the existing chats
      const chatUserIds = new Set<string>();
      searchResults.forEach((chat) => {
        if (chat.participantIds) {
          chat.participantIds.forEach((id) => chatUserIds.add(id));
        }
      });
      
      // Filter out users who are already in chats
      return globalUsers.filter((user) => !chatUserIds.has(user.uid));
    }, [globalUsers, searchResults]);

    // Render chat item
    const renderChatItem = useCallback(
      (chat: ChatListItem) => (
        <Pressable
          key={chat.id}
          onPress={() => {
            Keyboard.dismiss();
            onSelectResult(chat.id);
          }}
          className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
        >
          <View className="mr-3">
            <Avatar uri={chat.displayPhotoURL} name={chat.displayName} size="sm" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
              {chat.displayName}
            </Text>
            {chat.lastMessage && (
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {chat.lastMessage.text}
              </Text>
            )}
          </View>
        </Pressable>
      ),
      [onSelectResult]
    );

    // Render user item
    const renderUserItem = useCallback(
      (user: UserSearchResult) => (
        <Pressable
          key={user.uid}
          onPress={() => {
            Keyboard.dismiss();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectUser(user);
          }}
          className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
        >
          <View className="mr-3">
            <Avatar uri={user.photoURL} name={user.displayName} size="sm" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
              {user.displayName}
            </Text>
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              @{user.username}
            </Text>
          </View>
        </Pressable>
      ),
      [onSelectUser]
    );

    // Section header component
    const SectionHeader = useCallback(
      ({ title, showMore }: { title: string; showMore?: boolean }) => (
        <View className="flex-row items-center justify-between px-4 py-2 bg-gray-50">
          <Text className="text-xs font-semibold tracking-wide text-gray-500">
            {title}
          </Text>
          {showMore && (
            <Pressable>
              <Text className="text-xs font-medium text-blue-500">Show More</Text>
            </Pressable>
          )}
        </View>
      ),
      []
    );

    // Inline empty state (smaller, consistent)
    const InlineEmptyState = useCallback(
      ({ message }: { message: string }) => (
        <View className="px-4 py-4 bg-white">
          <Text className="text-sm text-gray-400">{message}</Text>
        </View>
      ),
      []
    );

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            paddingTop: insets.top,
          },
          overlayStyle,
        ]}
        pointerEvents={isVisible ? 'auto' : 'none'}
      >
        {/* Search Header */}
        <View className="flex-row items-center px-4 py-2">
          {/* Search Input - Gluestack UI */}
          <Input
            variant="rounded"
            size="lg"
            className="flex-1 bg-gray-100 border-0"
            style={{ height: 44 }}
          >
            <InputSlot className="pl-3">
              <Search size={20} color="#9CA3AF" />
            </InputSlot>
            <InputField
              ref={inputRef}
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
              className="text-base"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {/* Clear X icon - only show when there's text */}
            {searchQuery.length > 0 && (
              <InputSlot
                className="pr-3"
                onPress={() => onSearchQueryChange('')}
              >
                {/* Custom filled circle with X - no stroke outline */}
                <View className="items-center justify-center w-5 h-5 bg-gray-400 rounded-full">
                  <X size={12} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </InputSlot>
            )}
          </Input>

          {/* Close Button - matches input height of 44px with matching border */}
          <Pressable
            onPress={handleClose}
            className="items-center justify-center ml-2 bg-gray-100 border border-gray-200 rounded-full"
            style={{ width: 44, height: 44 }}
          >
            <X size={22} color="#374151" />
          </Pressable>
        </View>

        {/* Content */}
        {hasSearchQuery ? (
          // Search Results - Always show both sections
          <View className="flex-1">
            <FlatList
              data={[1]} // Dummy data to render our custom layout
              keyExtractor={() => 'search-content'}
              keyboardShouldPersistTaps="handled"
              renderItem={() => (
                <View>
                  {/* CHATS Section - Always visible */}
                  <SectionHeader title="CHATS" />
                  {searchResults.length > 0 ? (
                    searchResults.map((chat, index) => (
                      <View key={chat.id}>
                        {renderChatItem(chat)}
                        {index < searchResults.length - 1 && (
                          <View className="h-px ml-16 bg-gray-100" />
                        )}
                      </View>
                    ))
                  ) : (
                    <InlineEmptyState message="No matching chats" />
                  )}

                  {/* GLOBAL SEARCH Section - Always visible when query >= 2 chars */}
                  {/* Excludes users already shown in CHATS section */}
                  {hasMinQueryLength && (
                    <>
                      <SectionHeader title="GLOBAL SEARCH" showMore={filteredGlobalUsers.length > 0} />
                      {globalLoading ? (
                        <View className="flex-row items-center px-4 py-4 bg-white">
                          <ActivityIndicator size="small" color="#3B82F6" />
                          <Text className="ml-3 text-sm text-gray-400">Searching...</Text>
                        </View>
                      ) : filteredGlobalUsers.length > 0 ? (
                        filteredGlobalUsers.map((user, index) => (
                          <View key={user.uid}>
                            {renderUserItem(user)}
                            {index < filteredGlobalUsers.length - 1 && (
                              <View className="h-px ml-16 bg-gray-100" />
                            )}
                          </View>
                        ))
                      ) : (
                        <InlineEmptyState message="No users found" />
                      )}
                    </>
                  )}
                </View>
              )}
            />
          </View>
        ) : (
          // Recent Searches (no query) - Telegram-style list
          <View className="flex-1">
            {recentSearches.length > 0 ? (
              <>
                {/* RECENT header with Clear button */}
                <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
                  <Text className="text-xs font-semibold tracking-wide text-gray-500">
                    RECENT
                  </Text>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onClearSearches();
                    }}
                  >
                    <Text className="text-sm font-medium text-blue-500">Clear</Text>
                  </Pressable>
                </View>

                {/* Recent searches list */}
                <FlatList
                  data={recentSearches}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        Keyboard.dismiss();
                        onSelectRecentSearch(item);
                      }}
                      className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
                    >
                      <View className="mr-3">
                        <Avatar uri={item.photoURL} name={item.displayName} size="sm" />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-base font-medium text-gray-900"
                          numberOfLines={1}
                        >
                          {item.displayName}
                        </Text>
                        <Text className="text-sm text-gray-500" numberOfLines={1}>
                          {item.type === 'chat' ? 'Chat' : 'User'}
                        </Text>
                      </View>
                    </Pressable>
                  )}
                  ItemSeparatorComponent={() => (
                    <View className="h-px ml-16 bg-gray-100" />
                  )}
                />
              </>
            ) : (
              <View className="items-center justify-center flex-1 py-20">
                <Text className="text-gray-500">Search for users or chats</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  }
);

ChatSearchOverlay.displayName = 'ChatSearchOverlay';

export type { ChatSearchOverlayProps };
