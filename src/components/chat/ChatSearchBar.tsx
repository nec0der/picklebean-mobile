/**
 * ChatSearchBar - Telegram-style search bar for chats
 * Shows recent searches when empty, filters chats when typing
 */

import { memo, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Image,
  Keyboard,
} from 'react-native';
import { Search, X, Clock, MessageCircle } from 'lucide-react-native';
import type { RecentSearch, ChatListItem } from '@/types/chat';

interface ChatSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  recentSearches: RecentSearch[];
  filteredChats: ChatListItem[];
  onSelectChat: (chatId: string) => void;
  onSelectRecentSearch: (search: RecentSearch) => void;
  onRemoveRecentSearch: (id: string) => void;
  onClearRecentSearches: () => void;
  isSearching: boolean;
}

export const ChatSearchBar = memo(
  ({
    value,
    onChangeText,
    recentSearches,
    filteredChats,
    onSelectChat,
    onSelectRecentSearch,
    onRemoveRecentSearch,
    onClearRecentSearches,
    isSearching,
  }: ChatSearchBarProps) => {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = useCallback(() => {
      onChangeText('');
      inputRef.current?.focus();
    }, [onChangeText]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      // Delay hiding suggestions to allow tap on items
      setTimeout(() => setIsFocused(false), 200);
    }, []);

    const showSuggestions = isFocused && !value.trim();
    const showResults = isFocused && value.trim().length > 0;

    return (
      <View className="relative">
        {/* Search Input */}
        <View className="flex-row items-center px-4 py-2 mx-4 mt-2 mb-2 bg-gray-100 rounded-xl">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search chats..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-base text-gray-900"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {value.length > 0 && (
            <Pressable onPress={handleClear} className="p-1 -mr-1">
              <X size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Recent Searches Dropdown */}
        {showSuggestions && recentSearches.length > 0 && (
          <View className="absolute left-0 right-0 z-10 mx-4 bg-white border border-gray-100 shadow-lg top-14 rounded-xl">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
              <Text className="text-sm font-medium text-gray-500">
                Recent Searches
              </Text>
              <Pressable onPress={onClearRecentSearches}>
                <Text className="text-sm font-medium text-blue-500">Clear</Text>
              </Pressable>
            </View>

            {/* Recent Search Items */}
            {recentSearches.slice(0, 5).map((search) => (
              <Pressable
                key={search.id}
                onPress={() => onSelectRecentSearch(search)}
                className="flex-row items-center px-4 py-3 active:bg-gray-50"
              >
                <View className="items-center justify-center w-10 h-10 mr-3 bg-gray-100 rounded-full">
                  {search.photoURL ? (
                    <Image
                      source={{ uri: search.photoURL }}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <Clock size={18} color="#9CA3AF" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base text-gray-900" numberOfLines={1}>
                    {search.displayName}
                  </Text>
                  {search.username && (
                    <Text className="text-sm text-gray-500" numberOfLines={1}>
                      @{search.username}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => onRemoveRecentSearch(search.id)}
                  className="p-2 -mr-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color="#9CA3AF" />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}

        {/* Search Results */}
        {showResults && (
          <View className="absolute left-0 right-0 z-10 mx-4 bg-white border border-gray-100 shadow-lg top-14 rounded-xl max-h-80">
            {filteredChats.length > 0 ? (
              <FlatList
                data={filteredChats.slice(0, 10)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      Keyboard.dismiss();
                      onSelectChat(item.id);
                    }}
                    className="flex-row items-center px-4 py-3 active:bg-gray-50"
                  >
                    <View className="items-center justify-center w-10 h-10 mr-3 bg-gray-100 rounded-full">
                      {item.displayPhotoURL ? (
                        <Image
                          source={{ uri: item.displayPhotoURL }}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <MessageCircle size={18} color="#9CA3AF" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base text-gray-900" numberOfLines={1}>
                        {item.displayName}
                      </Text>
                      {item.lastMessage && (
                        <Text className="text-sm text-gray-500" numberOfLines={1}>
                          {item.lastMessage.text}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                )}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View className="items-center justify-center py-8">
                <Text className="text-gray-500">No chats found</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
);

ChatSearchBar.displayName = 'ChatSearchBar';

export type { ChatSearchBarProps };
