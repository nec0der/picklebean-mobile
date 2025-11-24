import { View, Text, TouchableOpacity } from 'react-native';
import { Box, Heading, VStack } from '@gluestack-ui/themed';
import type { AuthStackScreenProps } from '@/types/navigation';

type SelectGenderScreenProps = AuthStackScreenProps<'SelectGender'>;

export const SelectGenderScreen = ({ navigation, route }: SelectGenderScreenProps) => {
  const { username, password } = route.params;

  const handleGenderSelect = (gender: 'male' | 'female') => {
    navigation.navigate('UploadPhoto', {
      username,
      password,
      gender,
    });
  };

  return (
    <Box className="justify-center flex-1 px-6 bg-white">
      <VStack space="xl">
        {/* Header */}
        <VStack space="sm" className="items-center">
          <Heading size="3xl" className="text-center text-gray-900">
            Select Gender
          </Heading>
          <Text className="text-lg text-center text-gray-600">
            This helps us create the right leaderboards for you
          </Text>
        </VStack>

        {/* Gender Selection Buttons */}
        <VStack space="md" className="mt-8">
          <TouchableOpacity
            onPress={() => handleGenderSelect('male')}
            className="items-center justify-center h-32 bg-blue-500 rounded-2xl active:bg-blue-600"
          >
            <Text className="mb-2 text-4xl">👨</Text>
            <Text className="text-2xl font-bold text-white">Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleGenderSelect('female')}
            className="items-center justify-center h-32 bg-pink-500 rounded-2xl active:bg-pink-600"
          >
            <Text className="mb-2 text-4xl">👩</Text>
            <Text className="text-2xl font-bold text-white">Female</Text>
          </TouchableOpacity>
        </VStack>

        {/* Info Text */}
        <Text className="mt-4 text-sm text-center text-gray-500">
          We use this to organize rankings into Men's and Women's categories
        </Text>
      </VStack>
    </Box>
  );
};
