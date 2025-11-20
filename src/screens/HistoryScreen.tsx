import { memo, useCallback, useState, Fragment } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History } from 'lucide-react-native';
import type { TabScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMatches } from '@/hooks/firestore/useMatches';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { MatchCard } from '@/components/history/MatchCard';
import { MatchDetailModal } from '@/components/history/MatchDetailModal';
import type { MatchHistoryRecord } from '@/types/user';

/**
 * Helper function to determine time group for a match (from web app)
 */
const getTimeGroup = (matchDate: Date | unknown): string => {
  let date: Date;
  
  // Convert to Date object
  if (matchDate instanceof Date) {
    date = matchDate;
  } else if (matchDate && typeof matchDate === 'object' && 'toDate' in matchDate) {
    date = (matchDate as { toDate: () => Date }).toDate();
  } else {
    date = new Date(matchDate as string | number);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const matchDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysDiff = Math.floor((today.getTime() - matchDay.getTime()) / (1000 * 60 * 60 * 24));

  // Today
  if (matchDay.getTime() === today.getTime()) {
    return 'Today';
  }
  
  // Yesterday
  if (matchDay.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  
  // This Week (2-6 days ago)
  if (daysDiff >= 2 && daysDiff <= 6) {
    return 'This Week';
  }
  
  // Last Week (7-13 days ago)
  if (daysDiff >= 7 && daysDiff <= 13) {
    return 'Last Week';
  }
  
  // Earlier This Month (14+ days but same month)
  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return 'Earlier This Month';
  }
  
  // Last Month
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  if (date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()) {
    return 'Last Month';
  }
  
  // Older
  return 'Older';
};

export const HistoryScreen = memo(({}: TabScreenProps<'History'>) => {
  const { user } = useAuth();
  const { matches, loading, error, refetch } = useMatches(user?.id || '', 50);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    // Give it a moment to feel responsive
    setTimeout(() => setRefreshing(false), 500);
  }, [refetch]);

  const handleMatchPress = useCallback((match: MatchHistoryRecord) => {
    setSelectedMatch(match);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    // Wait for animation to complete before clearing
    setTimeout(() => setSelectedMatch(null), 300);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: MatchHistoryRecord; index: number }) => {
      const currentGroup = getTimeGroup(item.createdAt);
      const previousGroup = index > 0 ? getTimeGroup(matches[index - 1].createdAt) : null;
      const showDivider = currentGroup !== previousGroup;

      return (
        <Fragment>
          {showDivider && (
            <View className={currentGroup === 'Today' ? 'pb-2' : 'py-4'}>
              <Text className="text-xs font-semibold text-gray-500 uppercase">
                {currentGroup}
              </Text>
            </View>
          )}
          <MatchCard match={item} onPress={handleMatchPress} />
        </Fragment>
      );
    },
    [matches, handleMatchPress]
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
    <>
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        {/* Match List */}
        <FlatList
          data={matches}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      {/* Match Detail Modal */}
      <MatchDetailModal
        visible={modalVisible}
        match={selectedMatch}
        onClose={handleCloseModal}
      />
    </>
  );
});

HistoryScreen.displayName = 'HistoryScreen';
