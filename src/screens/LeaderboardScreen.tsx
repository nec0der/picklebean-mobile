import { memo, useState, useCallback, useRef } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import type { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import type { TabScreenProps } from '@/types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { LoadingSpinner } from '@/components/common';
import { CategorySelect, parseCategoryFilter, type CategoryFilter } from '@/components/leaderboard/CategorySelect';
import { LeaderboardPage } from '@/components/leaderboard/LeaderboardPage';

const categories: CategoryFilter[] = [
  'all_doubles',
  'all_singles',
  'mens_doubles',
  'womens_doubles',
  'mens_singles',
  'womens_singles',
];

export const LeaderboardScreen = memo(({}: TabScreenProps<'Leaderboard'>) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user: currentUser } = useAuth();
  const pagerRef = useRef<PagerView>(null);
  
  // Start with "Doubles" as default (index 0)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState<Record<number, boolean>>({});

  const selectedCategory = categories[selectedIndex];

  const handleCategoryChange = useCallback((category: CategoryFilter) => {
    const index = categories.indexOf(category);
    if (index !== -1) {
      setSelectedIndex(index);
      pagerRef.current?.setPage(index);
    }
  }, []);

  const handlePageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
    setSelectedIndex(e.nativeEvent.position);
  }, []);

  const handleUserPress = useCallback((username: string) => {
    navigation.navigate('UserProfile', { username });
  }, [navigation]);

  const handleRefresh = useCallback((index: number, refetch: () => void) => {
    setRefreshing(prev => ({ ...prev, [index]: true }));
    refetch();
    setTimeout(() => {
      setRefreshing(prev => ({ ...prev, [index]: false }));
    }, 500);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['right', 'left']}>
      {/* Category Filter */}
      <View className="px-4 pt-3 pb-4 border-b border-gray-200">
        <CategorySelect
          value={selectedCategory}
          onChange={handleCategoryChange}
        />
      </View>

      {/* Swipeable Pages */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1, flexDirection: 'column' }}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {categories.map((categoryFilter, index) => (
          <LeaderboardPageWrapper
            key={categoryFilter}
            categoryFilter={categoryFilter}
            currentUserId={currentUser?.id}
            refreshing={refreshing[index] || false}
            onRefresh={handleRefresh}
            onUserPress={handleUserPress}
            index={index}
          />
        ))}
      </PagerView>
    </SafeAreaView>
  );
});

LeaderboardScreen.displayName = 'LeaderboardScreen';

// Wrapper component for each page
interface LeaderboardPageWrapperProps {
  categoryFilter: CategoryFilter;
  currentUserId?: string;
  refreshing: boolean;
  onRefresh: (index: number, refetch: () => void) => void;
  onUserPress: (username: string) => void;
  index: number;
}

const LeaderboardPageWrapper = memo(({
  categoryFilter,
  currentUserId,
  refreshing,
  onRefresh,
  onUserPress,
  index,
}: LeaderboardPageWrapperProps) => {
  const { category, gender } = parseCategoryFilter(categoryFilter);
  const { rankings, loading, refetch } = useLeaderboard(category, gender, 50);

  const handleRefresh = useCallback(() => {
    onRefresh(index, refetch);
  }, [index, onRefresh, refetch]);

  // Show loading for initial load only
  if (loading && rankings.length === 0) {
    return (
      <View style={{ flex: 1 }} className="items-center justify-center">
        <LoadingSpinner />
        <Text className="mt-4 text-gray-600">Loading rankings...</Text>
      </View>
    );
  }

  return (
    // <View style={{ flex: 1, flexDirection: 'column' }} >
      <LeaderboardPage
        rankings={rankings}
        category={category}
        loading={loading}
        refreshing={refreshing}
        currentUserId={currentUserId}
        onRefresh={handleRefresh}
        onUserPress={onUserPress}
      />
    // </View>
  );
});

LeaderboardPageWrapper.displayName = 'LeaderboardPageWrapper';
