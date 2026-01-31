/**
 * CreateGroupScreen - Step 1: Select participants for group chat
 * Features:
 * - Search bar for filtering users
 * - Multi-select with checkboxes
 * - Selected count in header
 * - "Next" button when min participants selected
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Search, X, Check } from 'lucide-react-native';
import { Input, InputField, InputSlot } from '@gluestack-ui/themed';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/contexts/AuthContext';
import { useFollowing, FollowUser } from '@/hooks/firestore/useFollowLists';
import { useChats } from '@/hooks/firestore/useChats';
import { useSearchUsers } from '@/hooks/firestore/useSearchUsers';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { RootStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MIN_PARTICIPANTS = 0;
const MAX_PARTICIPANTS = 50;

interface SelectableUser {
  uid: string;
  displayName: string;
  username: string;
  photoURL: string | null;
}

export const CreateGroupScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { userDocument } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  // Fetch current user's following list
  const { users: followingUsers, loading: followingLoading } = useFollowing(
    userDocument?.uid || '',
    userDocument?.uid
  );
  
  // Fetch existing chats to get user list
  const { chats, loading: chatsLoading } = useChats();
  
  // Global user search
  const { results: globalUsers, loading: globalLoading, search: searchGlobal } = useSearchUsers();
  
  // Trigger global search when query changes (min 2 chars)
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchGlobal(searchQuery);
    }
  }, [searchQuery, searchGlobal]);
  
  // Build suggested users list: merge individual chats + following (deduplicated)
  const suggestedUsers = useMemo((): SelectableUser[] => {
    const userMap = new Map<string, SelectableUser>();
    const currentUserId = userDocument?.uid;
    
    // Add users from existing individual chats
    chats.forEach((chat) => {
      if (chat.type !== 'individual') return;
      
      const otherUserId = chat.participantIds?.find((id) => id !== currentUserId);
      if (!otherUserId) return;
      
      const otherUserInfo = chat.participantInfo?.[otherUserId];
      if (!otherUserInfo) return;
      
      userMap.set(otherUserId, {
        uid: otherUserId,
        displayName: otherUserInfo.displayName || chat.displayName,
        username: otherUserInfo.username || '',
        photoURL: otherUserInfo.photoURL || chat.displayPhotoURL || null,
      });
    });
    
    // Add following users
    followingUsers.forEach((user) => {
      if (userMap.has(user.uid)) return;
      
      userMap.set(user.uid, {
        uid: user.uid,
        displayName: user.displayName,
        username: user.username,
        photoURL: user.profilePictureUrl || null,
      });
    });
    
    return Array.from(userMap.values());
  }, [chats, followingUsers, userDocument?.uid]);
  
  // Filter suggested users based on search query
  const filteredSuggested = useMemo(() => {
    if (!searchQuery.trim()) return suggestedUsers;
    
    const query = searchQuery.toLowerCase().trim();
    return suggestedUsers.filter(
      (user) =>
        user.displayName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [suggestedUsers, searchQuery]);
  
  // Filter global search to exclude suggested users
  const filteredGlobalUsers = useMemo(() => {
    const suggestedIds = new Set(suggestedUsers.map((u) => u.uid));
    return globalUsers.filter((user) => !suggestedIds.has(user.uid));
  }, [globalUsers, suggestedUsers]);
  
  // Check for valid search query
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasMinQueryLength = searchQuery.trim().length >= 2;
  
  // Combined loading state
  const suggestedLoading = followingLoading || chatsLoading;
  
  // Can proceed to next step
  const canProceed = selectedUserIds.size >= MIN_PARTICIPANTS && selectedUserIds.size <= MAX_PARTICIPANTS;
  
  // Handle back navigation
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // Toggle user selection
  const toggleUserSelection = useCallback((userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        if (newSet.size >= MAX_PARTICIPANTS) {
          return prev; // Don't exceed max
        }
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);
  
  // Proceed to next step
  const handleNext = useCallback(() => {
    if (!canProceed) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    
    // Build selected users array with full info
    const allUsers = [...suggestedUsers, ...filteredGlobalUsers];
    const selectedUsers = Array.from(selectedUserIds)
      .map((uid) => allUsers.find((u) => u.uid === uid))
      .filter((u): u is SelectableUser => u !== undefined);
    
    navigation.navigate('SetGroupName', { selectedUsers });
  }, [canProceed, selectedUserIds, suggestedUsers, filteredGlobalUsers, navigation]);
  
  // Render user row with checkbox
  const renderUserRow = useCallback(
    (user: SelectableUser) => {
      const isSelected = selectedUserIds.has(user.uid);
      
      return (
        <Pressable
          key={user.uid}
          onPress={() => toggleUserSelection(user.uid)}
          className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
        >
          {/* Checkbox */}
          <View
            className={`mr-3 items-center justify-center w-6 h-6 border-2 rounded ${
              isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}
          >
            {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
          </View>
          
          {/* Avatar */}
          <View className="mr-3">
            <Avatar uri={user.photoURL} name={user.displayName} size="sm" />
          </View>
          
          {/* User info */}
          <View className="flex-1">
            <Text className="text-base font-medium !text-gray-900" numberOfLines={1}>
              {user.displayName}
            </Text>
            <Text className="text-sm !text-gray-500" numberOfLines={1}>
              @{user.username}
            </Text>
          </View>
        </Pressable>
      );
    },
    [selectedUserIds, toggleUserSelection]
  );
  
  // Section header
  const SectionHeader = useCallback(
    ({ title }: { title: string }) => (
      <View className="px-4 py-2 bg-gray-50">
        <Text className="text-xs font-semibold tracking-wide !text-gray-500">
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
        <Text className="text-sm !text-gray-400">{message}</Text>
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
        
        <View className="flex-1">
          <Text className="text-xl font-semibold !text-gray-900">
            New Group
          </Text>
          <Text className={`text-sm !text-gray-500`}>
            {selectedUserIds.size} selected
          </Text>
        </View>
        
        {/* Next button - always visible with rounded-full style */}
        <Pressable
          onPress={handleNext}
          disabled={!canProceed}
          className={`px-5 py-2 rounded-full ${canProceed ? 'bg-blue-500 active:bg-blue-600' : 'opacity-0'}`}
        >
          <Text className="font-semibold !text-white">Next</Text>
        </Pressable>
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
        data={[1]}
        keyExtractor={() => 'content'}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={() => (
          <View>
            {hasSearchQuery ? (
              // Search Mode
              <>
                <SectionHeader title="SUGGESTED" />
                {suggestedLoading ? (
                  <View className="flex-row items-center px-4 py-4 bg-white">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="ml-3 text-sm !text-gray-400">Loading...</Text>
                  </View>
                ) : filteredSuggested.length > 0 ? (
                  filteredSuggested.map((user, index) => (
                    <View key={user.uid}>
                      {renderUserRow(user)}
                      {index < filteredSuggested.length - 1 && (
                        <View className="h-px ml-16 bg-gray-100" />
                      )}
                    </View>
                  ))
                ) : (
                  <EmptyState message="No matching users" />
                )}
                
                {hasMinQueryLength && (
                  <>
                    <SectionHeader title="GLOBAL SEARCH" />
                    {globalLoading ? (
                      <View className="flex-row items-center px-4 py-4 bg-white">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="ml-3 text-sm !text-gray-400">Searching...</Text>
                      </View>
                    ) : filteredGlobalUsers.length > 0 ? (
                      filteredGlobalUsers.map((user, index) => (
                        <View key={user.uid}>
                          {renderUserRow({
                            uid: user.uid,
                            displayName: user.displayName,
                            username: user.username,
                            photoURL: user.photoURL || null,
                          })}
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
              // No Search
              <>
                <SectionHeader title="SUGGESTED" />
                {suggestedLoading ? (
                  <View className="items-center justify-center py-10">
                    <LoadingSpinner />
                  </View>
                ) : suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user, index) => (
                    <View key={user.uid}>
                      {renderUserRow(user)}
                      {index < suggestedUsers.length - 1 && (
                        <View className="h-px ml-16 bg-gray-100" />
                      )}
                    </View>
                  ))
                ) : (
                  <View className="items-center py-10">
                    <Text className="!text-gray-500">No users available</Text>
                    <Text className="mt-1 text-sm !text-gray-400">
                      Search for users to add to your group
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
