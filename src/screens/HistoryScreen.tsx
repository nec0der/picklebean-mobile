import { memo, useCallback, useState, Fragment, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Trophy, TrendingUp } from 'lucide-react-native';
import type { TabScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMatches } from '@/hooks/firestore/useMatches';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import { MatchCard } from '@/components/history/MatchCard';
import { MatchDetailModal } from '@/components/history/MatchDetailModal';
import { getTimeGroup } from '@/lib/dateFormat';
import type { MatchHistoryRecord } from '@/types/user';

export const HistoryScreen = memo(({}: TabScreenProps<'History'>) => {
  const { user } = useAuth();
  const { matches, loading, error, refetch } = useMatches(user?.id || '', 50);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalMatches = matches.length;
    const wins = matches.filter(m => m.result === 'win').length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    // Calculate current streak
    let currentStreak = 0;
    let streakType: 'win' | 'loss' | null = null;
    
    for (const match of matches) {
      if (streakType === null) {
        streakType = match.result;
        currentStreak = 1;
      } else if (match.result === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { totalMatches, wins, losses, winRate, currentStreak, streakType };
  }, [matches]);

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
        <SafeAreaView edges={['right', 'left']}>
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
      <SafeAreaView className="flex-1 bg-white" edges={['right', 'left']}>
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
          ListHeaderComponent={
            matches.length > 0 ? (
              <View className="flex-row gap-2 mb-6">
                {/* Total Matches */}
                <View className="flex-1 p-4 rounded-lg bg-gray-50">
                  <Text className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                    Matches
                  </Text>
                  <Text className="text-2xl font-bold text-gray-900">
                    {stats.totalMatches}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-600">
                    {stats.wins}W - {stats.losses}L
                  </Text>
                </View>

                {/* Win Rate */}
                <View className="flex-1 p-4 rounded-lg bg-green-50">
                  <View className="flex-row items-center mb-1">
                    <Trophy size={12} color="#16a34a" />
                    <Text className="ml-1 text-xs font-semibold text-green-700 uppercase">
                      Win Rate
                    </Text>
                  </View>
                  <Text className="text-2xl font-bold text-green-900">
                    {stats.winRate}%
                  </Text>
                  <Text className="mt-1 text-xs text-green-700">
                    {stats.wins} wins
                  </Text>
                </View>

                {/* Streak */}
                {stats.currentStreak > 1 && (
                  <View className={`flex-1 p-4 rounded-lg ${
                    stats.streakType === 'win' ? 'bg-blue-50' : 'bg-red-50'
                  }`}>
                    <View className="flex-row items-center mb-1">
                      <TrendingUp size={12} color={stats.streakType === 'win' ? '#2563eb' : '#dc2626'} />
                      <Text className={`ml-1 text-xs font-semibold uppercase ${
                        stats.streakType === 'win' ? 'text-blue-700' : 'text-red-700'
                      }`}>
                        Streak
                      </Text>
                    </View>
                    <Text className={`text-2xl font-bold ${
                      stats.streakType === 'win' ? 'text-blue-900' : 'text-red-900'
                    }`}>
                      {stats.currentStreak}
                    </Text>
                    <Text className={`mt-1 text-xs ${
                      stats.streakType === 'win' ? 'text-blue-700' : 'text-red-700'
                    }`}>
                      {stats.streakType === 'win' ? 'wins' : 'losses'}
                    </Text>
                  </View>
                )}
              </View>
            ) : null
          }
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
