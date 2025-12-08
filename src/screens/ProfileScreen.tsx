import { memo, useState, useMemo } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LogOut, User, Eye, Users, UsersRound, Zap } from 'lucide-react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { TabScreenProps, RootStackParamList } from '@/types/navigation';
import type { NavigationProp } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/firestore/useLeaderboard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ProfileHeroSection } from '@/components/profile/ProfileHeroSection';
import { RankingItem } from '@/components/profile/RankingItem';
import { SettingsMenuItem } from '@/components/profile/SettingsMenuItem';
import { ShareProfileButton } from '@/components/profile/ShareProfileButton';

export const ProfileScreen = memo((_props: TabScreenProps<'Profile'>) => {
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { userDocument, firebaseUser, signOut, loading: authLoading } = useAuth();
  
  // Get rankings for each category
  const userGender =
    userDocument?.gender === 'male' || userDocument?.gender === 'female'
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

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    console.log('Edit profile');
  };

  const handlePrivacyToggle = async (isPublic: boolean): Promise<void> => {
    if (!userDocument?.uid) return;

    try {
      const userRef = doc(firestore, 'users', userDocument.uid);
      await updateDoc(userRef, {
        profileVisibility: isPublic ? 'public' : 'private',
      });
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError('Failed to update privacy settings');
    }
  };

  const handleProgramPaddle = () => {
    rootNavigation.navigate('ProgramPaddle');
  };

  // Get best profile picture
  const profilePicture = userDocument?.profilePictureUrl || firebaseUser?.photoURL || null;

  // Get display name (username with @)
  const fullName = userDocument?.displayName || firebaseUser?.displayName || 'User';

  // Calculate stats for simple text display
  const totalMatches = userDocument?.matchStats?.totalMatches || 0;
  const wins = userDocument?.matchStats?.wins || 0;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(0) : '0';

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
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <ProfileHeroSection
          profilePicture={profilePicture}
          fullName={fullName}
          onEditPress={handleEditProfile}
        />

        <View className="px-4">
          {/* Share Profile Button */}
          {userDocument?.username && (
            <View className="mt-6 mb-4">
              <ShareProfileButton username={userDocument.username} displayName={fullName} />
            </View>
          )}

          {/* Minimalistic Stats - Single Line */}
          <Text className="mb-6 text-sm text-center text-gray-600">
            {totalMatches} matches • {winRate}% win rate
          </Text>

          {/* Rankings Section */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-bold text-gray-900">Your Rankings</Text>

            <RankingItem
              category={categoryLabels.singles}
              position={singlesPosition}
              points={userDocument?.rankings?.singles || 1000}
              color="bg-blue-500"
              icon={User}
            />

            <RankingItem
              category={categoryLabels.doubles}
              position={doublesPosition}
              points={userDocument?.rankings?.sameGenderDoubles || 1000}
              color="bg-green-500"
              icon={Users}
            />

            <RankingItem
              category={categoryLabels.mixed}
              position={mixedPosition}
              points={userDocument?.rankings?.mixedDoubles || 1000}
              color="bg-purple-500"
              icon={UsersRound}
            />
          </View>

          {/* Settings */}
          <View className="mb-8">
            <Text className="mb-3 text-lg font-bold text-gray-900">Settings</Text>
            <View className="overflow-hidden bg-white border border-gray-200 rounded-xl">
              <SettingsMenuItem icon={User} title="Edit Profile" onPress={handleEditProfile} />

              {/* Tap to Play (NFC Write) */}
              <SettingsMenuItem
                icon={Zap}
                title="Tap to Play"
                onPress={handleProgramPaddle}
              />
              
              {/* Profile Visibility Toggle */}
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
                <View className="flex-row items-center flex-1">
                  <Eye size={20} color="#6B7280" />
                  <View className="flex-1 ml-3">
                    <Text className="text-base font-medium !text-gray-900">
                      Public Profile
                    </Text>
                    <Text className="mt-0.5 text-sm !text-gray-500">
                      {(userDocument?.profileVisibility || 'public') === 'public'
                        ? 'Others can view your profile'
                        : 'Only you can view your profile'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={(userDocument?.profileVisibility || 'public') === 'public'}
                  onValueChange={handlePrivacyToggle}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </View>

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
