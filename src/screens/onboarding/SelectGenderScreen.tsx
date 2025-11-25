import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Box, Heading, Button, ButtonText, VStack } from '@gluestack-ui/themed';
import { ChevronLeft, User2, Check } from 'lucide-react-native';
import type { AuthStackScreenProps } from '@/types/navigation';
import { InfoBottomSheet } from '@/components/common/InfoBottomSheet';

type SelectGenderScreenProps = AuthStackScreenProps<'SelectGender'>;

export const SelectGenderScreen = ({ navigation, route }: SelectGenderScreenProps) => {
  const { username, password } = route.params;
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const infoContent = [
    'Organize rankings into Men\'s and Women\'s categories',
    'Create fair competition',
    'Required for leaderboard placement',
    'You can update this later if needed'
  ];

  const handleNext = () => {
    if (selectedGender) {
      navigation.navigate('UploadPhoto', {
        username,
        password,
        gender: selectedGender
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 px-6">
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="self-start p-2 -ml-2"
        >
          <ChevronLeft size={28} color="#000" />
        </TouchableOpacity>

        {/* Header */}
        <VStack space="sm" className="mt-6">
          <Heading size="2xl" className="text-gray-900">
            Select Gender
          </Heading>
          <View className="flex-row flex-wrap items-center">
            <Text className="text-gray-600 text-md">
              Help us create fair competition.{' '}
            </Text>
            <TouchableOpacity onPress={() => setShowInfo(true)}>
              <Text className="text-blue-600 underline text-md">
                (Why?)
              </Text>
            </TouchableOpacity>
          </View>
        </VStack>

        {/* Gender Selection Buttons */}
        <VStack space="md" className="mt-8">
          {/* Male Button */}
          <TouchableOpacity
            onPress={() => setSelectedGender('male')}
            className={`rounded-xl border-2 p-4 ${
              selectedGender === 'male'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <User2 
                  size={24} 
                  color={selectedGender === 'male' ? '#2563EB' : '#6B7280'} 
                />
                <Text className={`ml-3 text-lg font-semibold ${
                  selectedGender === 'male' ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  Male
                </Text>
              </View>
              {selectedGender === 'male' && (
                <View className="items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Female Button */}
          <TouchableOpacity
            onPress={() => setSelectedGender('female')}
            className={`rounded-xl border-2 p-4 ${
              selectedGender === 'female'
                ? 'border-pink-600 bg-pink-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <User2 
                  size={24} 
                  color={selectedGender === 'female' ? '#DB2777' : '#6B7280'} 
                />
                <Text className={`ml-3 text-lg font-semibold ${
                  selectedGender === 'female' ? 'text-pink-600' : 'text-gray-900'
                }`}>
                  Female
                </Text>
              </View>
              {selectedGender === 'female' && (
                <View className="items-center justify-center w-6 h-6 bg-pink-600 rounded-full">
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </VStack>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Next Button */}
        <View className="pb-6">
          <Button
            size="xl"
            onPress={handleNext}
            isDisabled={!selectedGender}
            className={`rounded-xl ${selectedGender ? 'bg-green-600' : 'bg-gray-300'}`}
          >
            <ButtonText>Next</ButtonText>
          </Button>
        </View>
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
