import { memo, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LogOut, User, Eye } from 'lucide-react-native';
import type { TabScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMatches } from '@/hooks/firestore/useMatches';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { MatchCard } from '@/components/history/MatchCard';
import { ProfileHeroSection } from '@/components/profile/ProfileHeroSection';
import { QuickStatsRow } from '@/components/profile/QuickStatsRow';
import { RankingItem } from '@/components/profile/RankingItem';
import { SettingsMenuItem } from '@/components/profile/SettingsMenuItem';

export const ProfileScreen = memo(({ navigation }: TabScreenProps<'Profile'>) => {
  const { userDocument, firebaseUser, signOut, loading: authLoading } = useAuth();
  const { matches, loading: matchesLoading } = useMatches(userDocument?.uid || '', 3);
  
  // Get rankings for each category
  const userGender = userDocument?.gender === 'male' || userDocument?.gender === 'female' 
    ? userDocument.gender 
    : undefined;
  const { rankings: singlesRankings } = useLeaderboard('singles', userGender, 100);
  const { rankings: doublesRankings } = useLeaderboard('same_gender_doubles', userGender, 100);
  const { rankings: mixedRankings } = useLeaderboard('mixed_doubles', undefined, 100);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const mixedPosition = useMemo(() => {
    if (!userDocument?.uid || mixedRankings.length === 0) return null;
    const pos = mixedRankings.findIndex((u) => u.uid === userDocument.uid);
    return pos >= 0 ? pos + 1 : null;
  }, [mixedRankings, userDocument?.uid]);

  const handleLogout = async (): Promise<void> => {
    try {
      setError('');
      setLoading(true);
      await signOut();
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = useCallback(() => {
    // TODO: Navigate to edit profile screen
    console.log('Edit profile');
  }, []);

  const handleViewAllMatches = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  const handleViewLeaderboard = useCallback(() => {
    navigation.navigate('Leaderboard');
  }, [navigation]);

  // Get best profile picture
  const profilePicture = userDocument?.profilePictureUrl || firebaseUser?.photoURL || null;
  
  // Get full name
  const fullName = userDocument?.firstName && userDocument?.lastName
    ? `${userDocument.firstName} ${userDocument.lastName}`
    : firebaseUser?.displayName || userDocument?.displayName || 'User';

  // Calculate total points across all categories
  const totalPoints = (userDocument?.rankings?.singles || 1000) +
    (userDocument?.rankings?.sameGenderDoubles || 1000) +
    (userDocument?.rankings?.mixedDoubles || 1000);

  // Calculate stats
  const totalMatches = userDocument?.matchStats?.totalMatches || 0;
  const wins = userDocument?.matchStats?.wins || 0;
  const losses = userDocument?.matchStats?.losses || 0;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(0) : '0';

  // Calculate streak
  const calculateStreak = (): { type: 'win' | 'loss' | null; count: number } => {
    if (matches.length === 0) return { type: null, count: 0 };
    
    const recentResult = matches[0].result;
    let streak = 0;
    
    for (const match of matches) {
      if (match.result === recentResult) {
        streak++;
      } else {
        break;
      }
    }
    
    return { type: recentResult, count: streak };
  };

  const streak = calculateStreak();

  // Get category labels based on gender
  const getCategoryLabels = () => {
    const gender = userDocument?.gender;
    if (gender === 'male') {
      return {
        singles: "Men's Singles",
        doubles: "Men's Doubles",
        mixed: 'Mixed Doubles',
      };
    } else if (gender === 'female') {
      return {
        singles: "Women's Singles",
        doubles: "Women's Doubles",
        mixed: 'Mixed Doubles',
      };
    }
    return {
      singles: 'Singles',
      doubles: 'Same Gender Doubles',
      mixed: 'Mixed Doubles',
    };
  };

  const categoryLabels = getCategoryLabels();

  if (authLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <ProfileHeroSection
          profilePicture={profilePicture}
          fullName={fullName}
          totalPoints={totalPoints}
          onEditPress={handleEditProfile}
        />

        {/* Quick Stats Row */}
        <QuickStatsRow totalMatches={totalMatches} winRate={winRate} streak={streak} />

        <View className="px-4 mt-6">
          {/* Rankings Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">Your Rankings</Text>
              <Pressable onPress={handleViewLeaderboard}>
                <Text className="text-sm font-medium text-primary-600">View Leaderboard →</Text>
              </Pressable>
            </View>

            <RankingItem
              category={categoryLabels.singles}
              position={singlesPosition}
              points={userDocument?.rankings?.singles || 1000}
              color="bg-blue-500"
              onPress={handleViewLeaderboard}
            />

            <RankingItem
              category={categoryLabels.doubles}
              position={doublesPosition}
              points={userDocument?.rankings?.sameGenderDoubles || 1000}
              color="bg-green-500"
              onPress={handleViewLeaderboard}
            />

            <RankingItem
              category={categoryLabels.mixed}
              position={mixedPosition}
              points={userDocument?.rankings?.mixedDoubles || 1000}
              color="bg-purple-500"
              onPress={handleViewLeaderboard}
            />
          </View>

          {/* Recent Matches */}
          {matches.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold text-gray-900">Recent Activity</Text>
                <Pressable onPress={handleViewAllMatches}>
                  <Text className="text-sm font-medium text-primary-600">View All →</Text>
                </Pressable>
              </View>

              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </View>
          )}

          {/* Personal Info */}
          {firebaseUser?.email && (
            <View className="mb-6">
              <Text className="mb-3 text-lg font-bold text-gray-900">Personal Information</Text>
              <View className="p-4 bg-white border border-gray-200 rounded-xl">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm text-gray-500">Email</Text>
                  <Text className="text-sm font-medium text-gray-900">{firebaseUser.email}</Text>
                </View>
                {userDocument?.gender && (
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-sm text-gray-500">Gender</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {userDocument.gender.charAt(0).toUpperCase() + userDocument.gender.slice(1)}
                    </Text>
                  </View>
                )}
                {userDocument?.dateOfBirth && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-500">Age</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {(() => {
                        const birthDate = new Date(userDocument.dateOfBirth);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                        return age;
                      })()}{' '}
                      years
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Settings */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-bold text-gray-900">Settings</Text>
            <View className="overflow-hidden bg-white border border-gray-200 rounded-xl">
              <SettingsMenuItem icon={User} title="Edit Profile" onPress={handleEditProfile} />
              <SettingsMenuItem icon={Eye} title="Privacy Settings" onPress={() => console.log('Privacy')} />
              <SettingsMenuItem
                icon={LogOut}
                title={loading ? 'Signing out...' : 'Sign Out'}
                onPress={handleLogout}
                destructive
              />
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="mb-4">
              <ErrorMessage message={error} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

ProfileScreen.displayName = 'ProfileScreen';
