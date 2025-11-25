import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { Box, Heading, Button, ButtonText, VStack } from '@gluestack-ui/themed';
import { ChevronLeft, Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import type { AuthStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { InfoBottomSheet } from '@/components/common/InfoBottomSheet';

type UploadPhotoScreenProps = AuthStackScreenProps<'UploadPhoto'>;

export const UploadPhotoScreen = ({ navigation, route }: UploadPhotoScreenProps) => {
  const { username, password, gender } = route.params;
  const { signUpWithUsername } = useAuth();
  
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const infoContent = [
    'Help other players recognize you',
    'Makes the game more social and personal',
    'You can skip and add later',
    'Photos are visible on leaderboards and in lobbies'
  ];

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload a profile picture.');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleChoosePhoto = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      await signUpWithUsername(username, password, gender, photoUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      await signUpWithUsername(username, password, gender, null);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
      setLoading(false);
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
            Add Profile Photo
          </Heading>
          <Text className="text-gray-600 text-md">
            Help others recognize you on the court
          </Text>
        </VStack>

        {/* Photo Preview */}
        <View className="items-center mt-8">
          <View className="relative">
            {photoUri ? (
              <Image 
                source={{ uri: photoUri }}
                className="w-32 h-32 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-32 h-32 bg-gray-100 rounded-full">
                <Camera size={48} color="#9CA3AF" />
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <VStack space="md" className="mt-8">
          {/* Take Photo Button */}
          <Button
            size="xl"
            onPress={handleTakePhoto}
            variant="outline"
            className="border-gray-300 rounded-xl"
            isDisabled={loading}
          >
            <View className="flex-row items-center">
              <Camera size={20} color="#374151" />
              <ButtonText className="ml-2 text-gray-900">Take Photo</ButtonText>
            </View>
          </Button>

          {/* Choose from Library Button */}
          <Button
            size="xl"
            onPress={handleChoosePhoto}
            variant="outline"
            className="border-gray-300 rounded-xl"
            isDisabled={loading}
          >
            <View className="flex-row items-center">
              <Upload size={20} color="#374151" />
              <ButtonText className="ml-2 text-gray-900">Choose from Library</ButtonText>
            </View>
          </Button>
        </VStack>

        {/* Info Link */}
        <TouchableOpacity 
          onPress={() => setShowInfo(true)}
          className="mt-4"
        >
          <Text className="text-center text-blue-600 underline">
            Why add a photo?
          </Text>
        </TouchableOpacity>

        {/* Bottom Actions */}
        <View className="flex-1" />
        <VStack space="md" className="pb-6">
          {photoUri ? (
            <Button
              size="xl"
              onPress={handleContinue}
              className="bg-green-600 rounded-xl"
              isDisabled={loading}
            >
              <ButtonText>Continue</ButtonText>
            </Button>
          ) : (
            <TouchableOpacity onPress={handleSkip} disabled={loading}>
              <Text className="text-center text-gray-600">Skip for now</Text>
            </TouchableOpacity>
          )}
        </VStack>
      </Box>

      {/* Info Bottom Sheet */}
      <InfoBottomSheet
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title="Profile Photo"
        content={infoContent}
      />
    </SafeAreaView>
  );
};
