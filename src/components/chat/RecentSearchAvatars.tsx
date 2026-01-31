/**
 * RecentSearchAvatars - Horizontal scrollable row of recent searched users
 * Telegram-style circular avatars with names below
 */

import { memo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { RecentSearch } from '@/types/chat';

interface RecentSearchAvatarsProps {
  recentSearches: RecentSearch[];
  onSelect: (search: RecentSearch) => void;
}

export const RecentSearchAvatars = memo(
  ({ recentSearches, onSelect }: RecentSearchAvatarsProps) => {
    if (recentSearches.length === 0) {
      return null;
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
      >
        {recentSearches.map((search) => (
          <RecentSearchItem key={search.id} search={search} onPress={onSelect} />
        ))}
      </ScrollView>
    );
  }
);

RecentSearchAvatars.displayName = 'RecentSearchAvatars';

interface RecentSearchItemProps {
  search: RecentSearch;
  onPress: (search: RecentSearch) => void;
}

const RecentSearchItem = memo(({ search, onPress }: RecentSearchItemProps) => {
  const handlePress = useCallback(() => {
    onPress(search);
  }, [search, onPress]);

  // Get first name only (truncate)
  const displayName = search.displayName.split(' ')[0].slice(0, 10);

  return (
    <Pressable
      onPress={handlePress}
      className="items-center mx-2"
      style={{ width: 64 }}
    >
      {/* Avatar - uses name-based colors */}
      <Avatar uri={search.photoURL} name={search.displayName} size="md" />

      {/* Name */}
      <Text
        className="mt-1 text-xs text-center text-gray-700"
        numberOfLines={1}
      >
        {displayName}
      </Text>
    </Pressable>
  );
});

RecentSearchItem.displayName = 'RecentSearchItem';

export type { RecentSearchAvatarsProps };
