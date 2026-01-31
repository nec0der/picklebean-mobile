import { memo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { Trophy } from 'lucide-react-native';
import type { GameCategory } from '@/types/lobby';
import type { UserDocument } from '@/types/user';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardPageProps {
  rankings: UserDocument[];
  category: GameCategory;
  loading: boolean;
  refreshing: boolean;
  currentUserId?: string;
  onRefresh: () => void;
  onUserPress: (username: string) => void;
}

export const LeaderboardPage = memo(({
  rankings,
  category,
  loading,
  refreshing,
  currentUserId,
  onRefresh,
  onUserPress,
}: LeaderboardPageProps) => {
  const renderItem = useCallback(
    ({ item, index }: { item: UserDocument; index: number }) => {
      const rank = index + 1;
      const isCurrentUser = item.uid === currentUserId;

      return (
        <LeaderboardRow
          user={item}
          rank={rank}
          category={category}
          isCurrentUser={isCurrentUser}
          onPress={() => onUserPress(item.username)}
        />
      );
    },
    [category, currentUserId, onUserPress]
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

  return (
    <FlatList
      data={rankings}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        // paddingBottom: 16,
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
});

LeaderboardPage.displayName = 'LeaderboardPage';
