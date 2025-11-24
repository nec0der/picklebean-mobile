import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Box, Heading, Button, ButtonText, VStack } from '@gluestack-ui/themed';
import { ChevronLeft, User2 } from 'lucide-react-native';
import type { AuthStackScreenProps } from '@/types/navigation';
import { InfoBottomSheet } from '@/components/common/InfoBottomSheet';

type SelectGenderScreenProps = AuthStackScreenProps<'SelectGender'>;

export const SelectGenderScreen = ({ navigation, route }: SelectGenderScreenProps) => {
  const { username, password } = route.params;
  const [showInfo, setShowInfo] = useState(false);

  const infoContent = [
    'Organize rankings into Men\'s and Women\'s categories',
    'Create fair competition',
    'Required for leaderboard placement',
    'You can update this later if needed'
  ];

  const handleGenderSelect = (gender: 'male' | 'female') => {
    navigation.navigate('UploadPhoto', {
      username,
      password,
      gender
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 px-6">
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>

        {/* Header */}
        <VStack space="sm" className="mt-6">
          <Heading size="2xl" className="text-gray-900">
            Select Gender
          </Heading>
          <Text className="text-gray-600 text-md">
            Help us create fair competition
          </Text>
        </VStack>

        {/* Gender Buttons */}
        <VStack space="md" className="mt-8">
          {/* Male Button */}
          <Button
            size="xl"
            onPress={() => handleGenderSelect('male')}
            className="bg-blue-600"
          >
            <View className="flex-row items-center">
              <User2 size={20} color="#FFFFFF" />
              <ButtonText className="ml-2">Male</ButtonText>
            </View>
          </Button>

          {/* Female Button */}
          <Button
            size="xl"
            onPress={() => handleGenderSelect('female')}
            className="bg-pink-600"
          >
            <View className="flex-row items-center">
              <User2 size={20} color="#FFFFFF" />
              <ButtonText className="ml-2">Female</ButtonText>
            </View>
          </Button>
        </VStack>

        {/* Info Link */}
        <TouchableOpacity 
          onPress={() => setShowInfo(true)}
          className="mt-4"
        >
          <Text className="text-center text-blue-600 underline">
            Why do we need this?
          </Text>
        </TouchableOpacity>
      </Box>

      {/* Info Bottom Sheet */}
      <InfoBottomSheet
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title="Gender Selection"
        content={infoContent}
      />
    </SafeAreaView>
  );
};
