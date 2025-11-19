import { memo, useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History } from 'lucide-react-native';
import type { TabScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMatches } from '@/hooks/firestore/useMatches';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { MatchCard } from '@/components/history/MatchCard';
import type { MatchHistoryRecord } from '@/types/user';

export const HistoryScreen = memo(({}: TabScreenProps<'History'>) => {
  const { user } = useAuth();
  const { matches, loading, error, refetch } = useMatches(user?.id || '', 50);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    // Give it a moment to feel responsive
    setTimeout(() => setRefreshing(false), 500);
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: MatchHistoryRecord }) => <MatchCard match={item} />,
    []
  );

  const keyExtractor = useCallback((item: MatchHistoryRecord) => item.id, []);

  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return (
      <View className="items-center justify-center flex-1 px-4 py-12">
        <View className="items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
          <History size={32} color="#9ca3af" />
        </View>
        <Text className="mb-2 text-xl font-bold text-gray-900">
          No Match History
        </Text>
        <Text className="text-base text-center text-gray-600">
          Play your first game to start building your match history!
        </Text>
      </View>
    );
  }, [loading]);

  // Loading state (initial load)
  if (loading && !refreshing) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner />
        <Text className="mt-4 text-gray-600">Loading match history...</Text>
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
              message={error.message || 'Failed to load match history'}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Match History</Text>
        <Text className="text-sm text-gray-600">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </Text>
      </View>

      {/* Match List */}
      <FlatList
        data={matches}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
});

HistoryScreen.displayName = 'HistoryScreen';
