import { memo } from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit2, Award } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';

interface ProfileHeroSectionProps {
  profilePicture: string | null;
  fullName: string;
  totalPoints: number;
  onEditPress?: () => void;
}

export const ProfileHeroSection = memo(({
  profilePicture,
  fullName,
  totalPoints,
  onEditPress,
}: ProfileHeroSectionProps) => {
  return (
    <LinearGradient
      colors={['#3b82f6', '#8b5cf6', '#6366f1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-4 pt-8 pb-6"
    >
      <View className="items-center">
        {/* Avatar with Edit Overlay */}
        <View className="relative mb-4">
          <Avatar uri={profilePicture} name={fullName} size="xl" />
          {onEditPress && (
            <Pressable
              onPress={onEditPress}
              className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg active:bg-gray-50"
            >
              <Edit2 size={16} color="#3b82f6" />
            </Pressable>
          )}
        </View>

        {/* Name */}
        <Text className="mb-2 text-2xl font-bold text-white">
          {fullName}
        </Text>

        {/* Total Points Badge */}
        <View className="flex-row items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
          <Award size={18} color="#fff" />
          <Text className="ml-2 text-lg font-semibold text-white">
            {totalPoints.toLocaleString()} pts
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
});

ProfileHeroSection.displayName = 'ProfileHeroSection';
