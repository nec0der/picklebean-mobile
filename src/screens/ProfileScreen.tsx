import { memo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import type { TabScreenProps } from '@/types/navigation';

export const ProfileScreen = memo(({}: TabScreenProps<'Profile'>) => {
  const { userDocument, firebaseUser, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Helper function to get the best available profile picture
  const getProfilePicture = (): string | null => {
    return userDocument?.profilePictureUrl || firebaseUser?.photoURL || null;
  };

  // Helper function to get the best available full name
  const getFullName = (): string => {
    if (userDocument?.firstName && userDocument?.lastName) {
      return `${userDocument.firstName} ${userDocument.lastName}`;
    }
    return firebaseUser?.displayName || userDocument?.displayName || 'User';
  };

  // Helper function to calculate age from date of birth
  const getAge = (): number | null => {
    if (!userDocument?.dateOfBirth) return null;

    const birthDate = new Date(userDocument.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Helper function to format gender display
  const getGenderDisplay = (): string | null => {
    if (!userDocument?.gender) return null;
    return userDocument.gender.charAt(0).toUpperCase() + userDocument.gender.slice(1);
  };

  // Helper function to get gender-based category labels
  const getCategoryLabels = () => {
    const userGender = userDocument?.gender;

    if (userGender === 'male') {
      return {
        singles: "Men's Singles",
        sameGenderDoubles: "Men's Doubles",
        mixedDoubles: 'Mixed Doubles',
      };
    } else if (userGender === 'female') {
      return {
        singles: "Women's Singles",
        sameGenderDoubles: "Women's Doubles",
        mixedDoubles: 'Mixed Doubles',
      };
    }

    return {
      singles: 'Singles',
      sameGenderDoubles: 'Same Gender Doubles',
      mixedDoubles: 'Mixed Doubles',
    };
  };

  const profilePicture = getProfilePicture();
  const fullName = getFullName();
  const age = getAge();
  const genderDisplay = getGenderDisplay();
  const categoryLabels = getCategoryLabels();

  if (authLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <View className="max-w-md mx-auto w-full">
          {/* User Profile Section */}
          <Card className="mb-6">
            <View className="p-6">
              <View className="items-center">
                {/* Profile Picture */}
                <View className="mb-4">
                  <Avatar uri={profilePicture} name={fullName} size="xl" />
                </View>

                {/* User Name */}
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {fullName}
                </Text>

                {/* User Email */}
                <View className="flex-row items-center mb-4">
                  <Text className="text-gray-600">{firebaseUser?.email}</Text>
                </View>

                {/* Additional Info */}
                <View className="space-y-2 w-full">
                  {genderDisplay && (
                    <View className="flex-row items-center justify-center">
                      <Text className="text-gray-600">{genderDisplay}</Text>
                    </View>
                  )}

                  {age && (
                    <View className="flex-row items-center justify-center">
                      <Text className="text-gray-600">{age} years old</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Card>

          {/* Ranking Information Section */}
          <Card className="mb-6">
            <View className="p-6">
              <View className="flex-row items-center justify-center mb-4">
                <Text className="text-lg font-semibold text-gray-900">Current Rankings</Text>
              </View>

              <View className="space-y-4">
                {/* Singles Ranking */}
                <View className="flex-row items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{categoryLabels.singles}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-blue-600">
                      {userDocument?.rankings?.singles || 1000}
                    </Text>
                    <Text className="text-xs text-gray-500">points</Text>
                  </View>
                </View>

                {/* Same Gender Doubles Ranking */}
                <View className="flex-row items-center justify-between p-3 bg-green-50 rounded-lg">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{categoryLabels.sameGenderDoubles}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-green-600">
                      {userDocument?.rankings?.sameGenderDoubles || 1000}
                    </Text>
                    <Text className="text-xs text-gray-500">points</Text>
                  </View>
                </View>

                {/* Mixed Doubles Ranking */}
                <View className="flex-row items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{categoryLabels.mixedDoubles}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-purple-600">
                      {userDocument?.rankings?.mixedDoubles || 1000}
                    </Text>
                    <Text className="text-xs text-gray-500">points</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Match Statistics Section */}
          <Card className="mb-6">
            <View className="p-6">
              <View className="flex-row items-center justify-center mb-4">
                <Text className="text-lg font-semibold text-gray-900">Match Statistics</Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Total # of matches</Text>
                  <Text className="font-semibold text-gray-900">
                    {userDocument?.matchStats?.totalMatches || 0}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Wins</Text>
                  <Text className="font-semibold text-green-600">
                    {userDocument?.matchStats?.wins || 0}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Losses</Text>
                  <Text className="font-semibold text-red-600">
                    {userDocument?.matchStats?.losses || 0}
                  </Text>
                </View>

                {/* Win Rate */}
                {(userDocument?.matchStats?.totalMatches || 0) > 0 && (
                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
                    <Text className="text-sm text-gray-600">Win Rate</Text>
                    <Text className="font-semibold text-blue-600">
                      {(
                        ((userDocument?.matchStats?.wins || 0) /
                          (userDocument?.matchStats?.totalMatches || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>

          {/* Error Message */}
          {error && (
            <View className="mb-4">
              <ErrorMessage message={error} />
            </View>
          )}

          {/* Logout Button */}
          <Button
            title={loading ? 'Signing out...' : 'Sign Out'}
            onPress={handleLogout}
            disabled={loading}
            variant="danger"
            className="mb-8"
          />
        </View>
      </View>
    </ScrollView>
  );
});

ProfileScreen.displayName = 'ProfileScreen';
