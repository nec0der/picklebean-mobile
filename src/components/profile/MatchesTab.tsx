import { memo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useMatches } from '@/hooks/firestore/useMatches';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { MatchFeedItem } from './MatchFeedItem';
import type { MatchHistoryRecord } from '@/types/user';

interface MatchesTabProps {
  userId: string;
}

export const MatchesTab = memo(({ userId }: MatchesTabProps) => {
  const { matches, loading, error } = useMatches(userId);

  // Show only recent 10 matches
  const recentMatches = matches.slice(0, 10);

  const handleMatchPress = (match: MatchHistoryRecord) => {
    // Navigate to match details
    // TODO: Implement match detail screen navigation
    console.log('Match pressed:', match.id);
  };

  const handleViewAll = () => {
    // TODO: Navigate to History tab
    // User can manually go to History tab to see all matches
    console.log('View all matches');
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 py-12">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 py-6">
        <ErrorMessage message="Failed to load matches" />
      </View>
    );
  }

  if (recentMatches.length === 0) {
    return (
      <View className="items-center justify-center flex-1 px-4 py-12">
        <Text className="mb-2 text-lg font-bold !text-gray-900">
          No matches yet
        </Text>
        <Text className="text-sm text-center !text-gray-500">
          Play your first match to see it here!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-4 bg-gray-50">
      <Text className="mb-3 text-base font-semibold !text-gray-900">
        Recent Matches
      </Text>

      <FlatList
        data={recentMatches}
        renderItem={({ item }) => (
          <MatchFeedItem
            match={item}
            onPress={() => handleMatchPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      {matches.length > 10 && (
        <Pressable
          onPress={handleViewAll}
          className="items-center py-4 active:opacity-70"
        >
          <Text className="text-sm font-semibold !text-green-600">
            View All Match History →
          </Text>
        </Pressable>
      )}
    </View>
  );
});

MatchesTab.displayName = 'MatchesTab';
