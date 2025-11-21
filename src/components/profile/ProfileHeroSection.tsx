import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Edit2 } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';

interface ProfileHeroSectionProps {
  profilePicture: string | null;
  fullName: string;
  onEditPress?: () => void;
}

export const ProfileHeroSection = memo(({
  profilePicture,
  fullName,
  onEditPress,
}: ProfileHeroSectionProps) => {
  return (
    <View className="px-4 pt-8 pb-6 bg-green-600">
      <View className="items-center">
        {/* Avatar with Edit Overlay */}
        <View className="relative mb-4">
          <Avatar uri={profilePicture} name={fullName} size="xl" />
          {onEditPress && (
            <Pressable
              onPress={onEditPress}
              className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg active:bg-gray-50"
            >
              <Edit2 size={16} color="#16a34a" />
            </Pressable>
          )}
        </View>

        {/* Name */}
        <Text className="text-2xl font-bold text-white">
          {fullName}
        </Text>
      </View>
    </View>
  );
});

ProfileHeroSection.displayName = 'ProfileHeroSection';
