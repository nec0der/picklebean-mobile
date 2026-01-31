import { memo, useMemo, useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';
import type { TabScreenProps, RootStackParamList } from '@/types/navigation';
import type { NavigationProp } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { RankingStatCard } from '@/components/profile/RankingStatCard';
import { MatchesTab } from '@/components/profile/MatchesTab';
import { isGravity } from '@/config/product';

const HEADER_HEIGHT = 56;

export const ProfileScreen = memo((props: TabScreenProps<'Profile'>) => {
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { userDocument, firebaseUser, loading: authLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Get rankings for each category
  const userGender =
    userDocument?.gender === 'male' || userDocument?.gender === 'female'
      ? userDocument.gender
      : undefined;
  const { rankings: singlesRankings } = useLeaderboard('singles', userGender, 100);
  const { rankings: doublesRankings } = useLeaderboard('same_gender_doubles', userGender, 100);

  // Calculate positions
  const singlesPosition = useMemo(() => {
    if (!userDocument?.uid || singlesRankings.length === 0) return null;
    const pos = singlesRankings.findIndex((u) => u.uid === userDocument.uid);
    return pos >= 0 ? pos + 1 : null;
  }, [singlesRankings, userDocument?.uid]);

  const doublesPosition = useMemo(() => {
    if (!userDocument?.uid || doublesRankings.length === 0) return null;
    const pos = doublesRankings.findIndex((u) => u.uid === userDocument.uid);
    return pos >= 0 ? pos + 1 : null;
  }, [doublesRankings, userDocument?.uid]);

  // Calculate win rate for stat cards
  const totalMatches = userDocument?.matchStats?.totalMatches || 0;
  const wins = userDocument?.matchStats?.wins || 0;
  const singlesWinRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const doublesWinRate = singlesWinRate; // For now, same as overall

  // Event handlers
  const handleEditProfile = () => {
    rootNavigation.navigate('EditProfile');
  };

  const handleSettings = () => {
    rootNavigation.navigate('Settings');
  };

  const handleFollowingPress = () => {
    if (userDocument?.uid) {
      rootNavigation.navigate('FollowList', {
        userId: userDocument.uid,
        initialTab: 'following',
      });
    }
  };

  const handleFollowersPress = () => {
    if (userDocument?.uid) {
      rootNavigation.navigate('FollowList', {
        userId: userDocument.uid,
        initialTab: 'followers',
      });
    }
  };

  const handleViewAllHistory = () => {
    // Navigate to Map tab (was History)
    props.navigation.navigate('Map');
  };

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Data will automatically refresh since hooks are reactive
    // Simulate a minimum refresh time for UX
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  // Get profile data
  const profilePicture = userDocument?.profilePictureUrl || firebaseUser?.photoURL || null;
  const fullName = userDocument?.displayName || firebaseUser?.displayName || 'User';
  const username = userDocument?.username || 'user';
  const bio = userDocument?.bio;
  const followingCount = userDocument?.followingCount || 0;
  const followersCount = userDocument?.followersCount || 0;

  // Set header title and right button (non-Gravity mode only)
  useEffect(() => {
    if (!isGravity) {
      props.navigation.setOptions({
        title: username,
        headerRight: () => (
          <Pressable onPress={handleSettings} className="mr-2 active:opacity-70">
            <Menu size={24} color="#6B7280" />
          </Pressable>
        ),
      });
    }
  }, [props.navigation, username]);

  if (authLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  // Prepare header content for MatchesTab
  const renderHeader = () => (
    <>
      {/* Hero Section */}
      <View className="px-4 py-6 bg-white">
        <ProfileHero
          profilePicture={profilePicture}
          fullName={fullName}
          username={username}
          bio={bio}
          followingCount={followingCount}
          followersCount={followersCount}
          isOwnProfile={true}
          onEditPress={handleEditProfile}
          onFollowingPress={handleFollowingPress}
          onFollowersPress={handleFollowersPress}
        />
      </View>

      {/* Section Divider */}
      {/* <View className="border-t-2 border-gray-300" /> */}

      {/* Rankings Section */}
      <View className="px-4 py-2 bg-white">
        <Text className="mb-3 text-lg font-bold text-gray-900">
          Rankings
        </Text>
        
        <View className="flex-row gap-2">
          <View className="flex-1">
            <RankingStatCard
              category="Singles"
              rank={singlesPosition}
              points={userDocument?.rankings?.singles || 1000}
              matchCount={totalMatches}
              winRate={singlesWinRate}
            />
          </View>

          <View className="flex-1">
            <RankingStatCard
              category="Doubles"
              rank={doublesPosition}
              points={userDocument?.rankings?.sameGenderDoubles || 1000}
              matchCount={totalMatches}
              winRate={doublesWinRate}
            />
          </View>
        </View>
      </View>

      {/* Section Divider */}
      {/* <View className="border-t-2 border-gray-300" /> */}
    </>
  );

  if (!userDocument?.uid) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 !bg-white" style={isGravity ? { paddingTop: insets.top } : undefined}>
      {/* Gravity Mode Custom Header - matches ChatsScreen style */}
      {isGravity && (
        <View 
          className="flex-row items-center justify-between px-4"
          style={{ height: HEADER_HEIGHT }}
        >
          <Text className="text-3xl font-bold text-gray-900">{username}</Text>
          <Pressable onPress={handleSettings} className="active:opacity-70">
            <Menu size={24} color="#6B7280" />
          </Pressable>
        </View>
      )}
      
      <MatchesTab 
        userId={userDocument.uid} 
        header={renderHeader()} 
        onViewAllHistory={handleViewAllHistory}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        isOwnProfile={true}
      />
    </View>
  );
});

ProfileScreen.displayName = 'ProfileScreen';
