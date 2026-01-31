/**
 * NewChatScreen - Select recipient(s) for a new chat
 * Features:
 * - Group Chat button at top
 * - Search input for filtering SUGGESTED and global search
 * - SUGGESTED list: existing chats + following (merged, deduplicated)
 * - Global search results (excludes anyone in SUGGESTED)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, ChevronRight, Users, Search, X } from 'lucide-react-native';
import { Input, InputField, InputSlot } from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/contexts/AuthContext';
import { useFollowing, FollowUser } from '@/hooks/firestore/useFollowLists';
import { useChats } from '@/hooks/firestore/useChats';
import { useSearchUsers } from '@/hooks/firestore/useSearchUsers';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { RootStackParamList } from '@/types/navigation';
import type { UserSearchResult } from '@/services/userService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Unified user type for SUGGESTED list
interface SuggestedUser {
  uid: string;
  displayName: string;
  username: string;
  photoURL: string | null;
  existingChatId?: string; // If there's an existing chat with this user
}

export const NewChatScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { userDocument } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch current user's following list
  const { users: followingUsers, loading: followingLoading } = useFollowing(
    userDocument?.uid || '',
    userDocument?.uid
  );
  
  // Fetch existing chats
  const { chats, loading: chatsLoading } = useChats();
  
  // Global user search
  const { results: globalUsers, loading: globalLoading, search: searchGlobal } = useSearchUsers();
  
  // Trigger global search when query changes (min 2 chars)
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchGlobal(searchQuery);
    }
  }, [searchQuery, searchGlobal]);
  
  // Build SUGGESTED list: merge existing individual chats + following users (deduplicated)
  const suggestedUsers = useMemo((): SuggestedUser[] => {
    const userMap = new Map<string, SuggestedUser>();
    const currentUserId = userDocument?.uid;
    
    // First, add users from existing individual chats
    chats.forEach((chat) => {
      if (chat.type !== 'individual') return;
      
      // Find the other user's ID
      const otherUserId = chat.participantIds?.find((id) => id !== currentUserId);
      if (!otherUserId) return;
      
      // Get other user's info from participantInfo
      const otherUserInfo = chat.participantInfo?.[otherUserId];
      if (!otherUserInfo) return;
      
      userMap.set(otherUserId, {
        uid: otherUserId,
        displayName: otherUserInfo.displayName || chat.displayName,
        username: otherUserInfo.username || '',
        photoURL: otherUserInfo.photoURL || chat.displayPhotoURL || null,
        existingChatId: chat.id,
      });
    });
    
    // Then, add following users (if not already in map)
    followingUsers.forEach((user) => {
      if (userMap.has(user.uid)) return; // Skip if already have chat
      
      userMap.set(user.uid, {
        uid: user.uid,
        displayName: user.displayName,
        username: user.username,
        photoURL: user.profilePictureUrl || null,
        existingChatId: undefined,
      });
    });
    
    return Array.from(userMap.values());
  }, [chats, followingUsers, userDocument?.uid]);
  
  // Filter SUGGESTED users based on search query
  const filteredSuggested = useMemo(() => {
    if (!searchQuery.trim()) return suggestedUsers;
    
    const query = searchQuery.toLowerCase().trim();
    return suggestedUsers.filter(
      (user) =>
        user.displayName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [suggestedUsers, searchQuery]);
  
  // Filter global search to exclude anyone already in SUGGESTED
  const filteredGlobalUsers = useMemo(() => {
    const suggestedIds = new Set(suggestedUsers.map((u) => u.uid));
    return globalUsers.filter((user) => !suggestedIds.has(user.uid));
  }, [globalUsers, suggestedUsers]);
  
  // Check for valid search query
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasMinQueryLength = searchQuery.trim().length >= 2;
  
  // Combined loading state
  const suggestedLoading = followingLoading || chatsLoading;
  
  // Handle back navigation
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // Handle group chat button
  const handleGroupChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateGroup');
  }, [navigation]);
  
  // Handle selecting a SUGGESTED user (navigate to existing chat or draft)
  const handleSelectSuggestedUser = useCallback(
    (user: SuggestedUser) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Keyboard.dismiss();
      
      if (user.existingChatId) {
        // Navigate to existing chat
        navigation.navigate('ChatDetail', { chatId: user.existingChatId });
      } else {
        // Navigate to draft mode
        navigation.navigate('ChatDetail', {
          recipientUser: {
            uid: user.uid,
            username: user.username,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
        });
      }
    },
    [navigation]
  );
  
  // Handle selecting a global search user (check for existing chat first)
  const handleSelectGlobalUser = useCallback(
    (user: UserSearchResult) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Keyboard.dismiss();
      
      // Check if there's an existing chat with this user
      const existingChat = chats.find(
        (chat) => chat.type === 'individual' && chat.participantIds?.includes(user.uid)
      );
      
      if (existingChat) {
        navigation.navigate('ChatDetail', { chatId: existingChat.id });
      } else {
        navigation.navigate('ChatDetail', {
          recipientUser: {
            uid: user.uid,
            username: user.username,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
          },
        });
      }
    },
    [navigation, chats]
  );
  
  // Render user row
  const renderUserRow = useCallback(
    (
      user: { uid: string; displayName: string; username: string; photoURL?: string | null },
      onPress: () => void
    ) => (
      <Pressable
        key={user.uid}
        onPress={onPress}
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
    []
  );
  
  // Section header
  const SectionHeader = useCallback(
    ({ title }: { title: string }) => (
      <View className="px-4 py-2 bg-gray-50">
        <Text className="text-xs font-semibold tracking-wide text-gray-500">
          {title}
        </Text>
      </View>
    ),
    []
  );
  
  // Empty state
  const EmptyState = useCallback(
    ({ message }: { message: string }) => (
      <View className="px-4 py-4 bg-white">
        <Text className="text-sm text-gray-400">{message}</Text>
      </View>
    ),
    []
  );
  
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable
          onPress={handleGoBack}
          className="p-1 mr-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={28} color="#374151" />
        </Pressable>
        
        <Text className="flex-1 text-xl font-semibold text-gray-900">
          New Chat
        </Text>
      </View>
      
      {/* Search Input */}
      <View className="px-4 py-3 border-b border-gray-100">
        <Input
          variant="rounded"
          size="lg"
          className="bg-gray-100 border-0"
          style={{ height: 44 }}
        >
          <InputSlot className="pl-3">
            <Search size={20} color="#9CA3AF" />
          </InputSlot>
          <InputField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search users..."
            placeholderTextColor="#9CA3AF"
            className="text-base"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <InputSlot
              className="pr-3"
              onPress={() => setSearchQuery('')}
            >
              <View className="items-center justify-center w-5 h-5 bg-gray-400 rounded-full">
                <X size={12} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </InputSlot>
          )}
        </Input>
      </View>
      
      {/* Content */}
      <FlatList
        data={[1]} // Dummy data to render custom layout
        keyExtractor={() => 'content'}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={() => (
          <View>
            {/* Group Chat Button */}
            <Pressable
              onPress={handleGroupChat}
              className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100 active:bg-gray-50"
            >
              <View className="items-center justify-center mr-3 bg-blue-100 rounded-full w-11 h-11">
                <Users size={22} color="#3B82F6" />
              </View>
              <Text className="flex-1 text-base font-medium text-gray-900">
                New Group Chat
              </Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
            
            {hasSearchQuery ? (
              // Search Mode: Show filtered SUGGESTED + filtered global results
              <>
                {/* SUGGESTED Section (filtered) */}
                <SectionHeader title="SUGGESTED" />
                {suggestedLoading ? (
                  <View className="flex-row items-center px-4 py-4 bg-white">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="ml-3 text-sm text-gray-400">Loading...</Text>
                  </View>
                ) : filteredSuggested.length > 0 ? (
                  filteredSuggested.map((user, index) => (
                    <View key={user.uid}>
                      {renderUserRow(
                        {
                          uid: user.uid,
                          displayName: user.displayName,
                          username: user.username,
                          photoURL: user.photoURL,
                        },
                        () => handleSelectSuggestedUser(user)
                      )}
                      {index < filteredSuggested.length - 1 && (
                        <View className="h-px ml-16 bg-gray-100" />
                      )}
                    </View>
                  ))
                ) : (
                  <EmptyState message="No matching users" />
                )}
                
                {/* GLOBAL SEARCH Section (excludes anyone in SUGGESTED) */}
                {hasMinQueryLength && (
                  <>
                    <SectionHeader title="GLOBAL SEARCH" />
                    {globalLoading ? (
                      <View className="flex-row items-center px-4 py-4 bg-white">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="ml-3 text-sm text-gray-400">Searching...</Text>
                      </View>
                    ) : filteredGlobalUsers.length > 0 ? (
                      filteredGlobalUsers.map((user, index) => (
                        <View key={user.uid}>
                          {renderUserRow(
                            {
                              uid: user.uid,
                              displayName: user.displayName,
                              username: user.username,
                              photoURL: user.photoURL,
                            },
                            () => handleSelectGlobalUser(user)
                          )}
                          {index < filteredGlobalUsers.length - 1 && (
                            <View className="h-px ml-16 bg-gray-100" />
                          )}
                        </View>
                      ))
                    ) : (
                      <EmptyState message="No users found" />
                    )}
                  </>
                )}
              </>
            ) : (
              // No Search: Show full SUGGESTED list
              <>
                <SectionHeader title="SUGGESTED" />
                {suggestedLoading ? (
                  <View className="items-center justify-center py-10">
                    <LoadingSpinner />
                  </View>
                ) : suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user, index) => (
                    <View key={user.uid}>
                      {renderUserRow(
                        {
                          uid: user.uid,
                          displayName: user.displayName,
                          username: user.username,
                          photoURL: user.photoURL,
                        },
                        () => handleSelectSuggestedUser(user)
                      )}
                      {index < suggestedUsers.length - 1 && (
                        <View className="h-px ml-16 bg-gray-100" />
                      )}
                    </View>
                  ))
                ) : (
                  <View className="items-center py-10">
                    <Text className="text-gray-500">No suggestions yet</Text>
                    <Text className="mt-1 text-sm text-gray-400">
                      Search for users to start a chat
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      />
    </View>
  );
};
