import { memo, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy } from 'lucide-react-native';
import type { TabScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { CategorySelect, parseCategoryFilter, type CategoryFilter } from '@/components/leaderboard/CategorySelect';
import { LeaderboardRow } from '@/components/leaderboard/LeaderboardRow';
import type { UserDocument } from '@/types/user';

export const LeaderboardScreen = memo(({}: TabScreenProps<'Leaderboard'>) => {
  const { user: currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('mens_doubles');
  const [refreshing, setRefreshing] = useState(false);

  // Parse category filter to get game category and gender
  const { category, gender } = parseCategoryFilter(selectedCategory);

  // Fetch leaderboard data
  const { rankings, loading, error, refetch } = useLeaderboard(category, gender, 50);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    // Give it a moment to feel responsive
    setTimeout(() => setRefreshing(false), 500);
  }, [refetch]);

  const renderItem = useCallback(
    ({ item, index }: { item: UserDocument; index: number }) => {
      const rank = index + 1;
      const isCurrentUser = item.uid === currentUser?.id;

      return (
        <LeaderboardRow
          user={item}
          rank={rank}
          category={category}
          isCurrentUser={isCurrentUser}
        />
      );
    },
    [category, currentUser?.id]
  );

  const keyExtractor = useCallback((item: UserDocument) => item.uid, []);

  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return (
      <View className="items-center justify-center flex-1 px-4 py-12">
        <View className="items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
          <Trophy size={32} color="#9ca3af" />
        </View>
        <Text className="mb-2 text-xl font-bold text-gray-900">
          No Rankings Yet
        </Text>
        <Text className="text-base text-center text-gray-600">
          Be the first to play and claim the top spot!
        </Text>
      </View>
    );
  }, [loading]);

  // Loading state (initial load)
  if (loading && !refreshing) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner />
        <Text className="mt-4 text-gray-600">Loading rankings...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView edges={['top']}>
          <View className="px-4 py-6">
            <ErrorMessage
              message={error.message || 'Failed to load leaderboard'}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-4 pt-3 pb-4 border-b border-gray-200">
        <Text className="mb-3 text-2xl font-bold text-gray-900">Leaderboard</Text>
        
        {/* Category Filter */}
        <CategorySelect
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </View>

      {/* Rankings List */}
      <FlatList
        data={rankings}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          rankings.length > 0 ? (
            <View className="py-4">
              <Text className="text-sm text-center text-gray-500">
                End of leaderboard • {rankings.length} players
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
});

LeaderboardScreen.displayName = 'LeaderboardScreen';
