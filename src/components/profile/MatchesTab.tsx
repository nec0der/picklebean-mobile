import { memo, useState, type ReactNode } from 'react';
import { View, Text, Pressable, FlatList, ScrollView, RefreshControl } from 'react-native';
import { useMatches } from '@/hooks/firestore/useMatches';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { MatchCard } from '@/components/history/MatchCard';
import { MatchDetailModal } from '@/components/history/MatchDetailModal';
import { isGravity } from '@/config/product';
import { FLOATING_TAB_BAR_HEIGHT } from '@/navigation/tabs/GravityTabNavigator';
import type { MatchHistoryRecord } from '@/types/user';

interface MatchesTabProps {
  userId: string;
  header?: ReactNode;
  onViewAllHistory?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  isOwnProfile?: boolean;
}

// Bottom padding for content - accounts for floating tab bar in Gravity mode
const CONTENT_BOTTOM_PADDING = isGravity ? FLOATING_TAB_BAR_HEIGHT : 16;

export const MatchesTab = memo(({ userId, header, onViewAllHistory, refreshing = false, onRefresh, isOwnProfile = false }: MatchesTabProps) => {
  const { matches, loading, error } = useMatches(userId);
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Show only recent 10 matches
  const recentMatches = matches.slice(0, 10);

  const handleMatchPress = (match: MatchHistoryRecord) => {
    setSelectedMatch(match);
    setModalVisible(true);
  };

  const handleViewAll = () => {
    onViewAllHistory?.();
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
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: CONTENT_BOTTOM_PADDING }}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {header}
        
        {/* Section header */}
        <View className="px-4 pt-6">
          <Text className="mb-3 text-lg font-bold text-gray-900">
            Matches
          </Text>
        </View>
        
        <View className="items-center justify-start px-4 py-12">
          <Text className="mb-2 text-lg font-bold !text-gray-900">
            No matches yet
          </Text>
          <Text className="text-sm text-center !text-gray-500">
            {isOwnProfile
              ? "Play your first match to see it here!"
              : "This user hasn't played any matches yet"
            }
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <>
      <FlatList
        data={recentMatches}
        renderItem={({ item }) => (
          <View className="px-4">
            <MatchCard
              match={item}
              onPress={handleMatchPress}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: CONTENT_BOTTOM_PADDING, backgroundColor: '#FFFFFF' }}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        ListHeaderComponent={
          <>
            {header}
            
            {/* Section header */}
            <View className="px-4 pt-6">
              <Text className="mb-3 text-lg font-bold text-gray-900">
                Matches
              </Text>
            </View>
          </>
        }
        ListFooterComponent={
          matches.length > 10 ? (
            <View className="px-4">
              <Pressable
                onPress={handleViewAll}
                className="items-center py-4 active:opacity-70"
              >
                <Text className="text-sm font-semibold !text-green-600">
                  View All Match History →
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />
      
      {/* Match Detail Modal */}
      <MatchDetailModal
        visible={modalVisible}
        match={selectedMatch}
        onClose={() => {
          setModalVisible(false);
          setSelectedMatch(null);
        }}
      />
    </>
  );
});

MatchesTab.displayName = 'MatchesTab';
