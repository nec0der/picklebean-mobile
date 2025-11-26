import { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, Image, Alert, Pressable } from 'react-native';
import { 
  Box, 
  Heading, 
  VStack,
  Text,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper
} from '@gluestack-ui/themed';
import { ChevronLeft, Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/Button';
import type { AuthStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
        {/* Top Bar - Back & Skip */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2"
          >
            <ChevronLeft size={28} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSkip}
            disabled={loading}
            className="p-2"
          >
            <Text className="text-lg font-semibold text-blue-600">
              Skip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <VStack space="sm" className="mt-6">
          <Heading size="2xl" className="text-gray-900">
            Add Profile Photo
          </Heading>
          <View className="flex-row flex-wrap items-center gap-1">
            <Text size="md" className="text-gray-600">
              Help others recognize you on the court.{" "}
            </Text>
            <TouchableOpacity onPress={() => setShowInfo(true)}>
              <Text size="md" className="!text-blue-600">
                Why add a photo?
              </Text>
            </TouchableOpacity>
          </View>
        </VStack>

        {/* Clickable Photo Circle */}
        <View className="items-center mt-8">
          <Pressable 
            onPress={handleChoosePhoto}
            disabled={loading}
            className="relative"
          >
            {photoUri ? (
              <>
                <Image 
                  source={{ uri: photoUri }}
                  className="w-48 h-48 rounded-full"
                />
                {/* Change photo badge */}
                <View className="absolute bottom-0 right-0 items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <Upload size={20} color="#FFFFFF" />
                </View>
              </>
            ) : (
              <View className="items-center justify-center w-48 h-48 border-2 border-gray-300 border-dashed rounded-full bg-gray-50">
                <Camera size={40} color="#9CA3AF" />
                <Text className="mt-4 text-xs text-gray-500">
                  Tap to upload
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Action Buttons - Grouped */}
        <VStack space="md" className="pb-8 mt-8">
          <Button
            title="Take Photo"
            variant="secondary"
            size="md"
            onPress={handleTakePhoto}
            disabled={loading}
            fullWidth
          />
          
          <Button
            title="Choose from Library"
            variant="secondary"
            size="md"
            onPress={handleChoosePhoto}
            disabled={loading}
            fullWidth
          />
          
          {photoUri && (
            <Button
              title="Done"
              size="md"
              onPress={handleContinue}
              disabled={loading}
              loading={loading}
              fullWidth
            />
          )}
        </VStack>
      </Box>

      {/* Info Actionsheet */}
      <Actionsheet 
        isOpen={showInfo} 
        onClose={() => setShowInfo(false)}
        snapPoints={[80]}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-6 pt-4 pb-12">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          
          <Heading size="xl" className="mt-4 mb-6 text-gray-900">
            Profile Photo
          </Heading>

          <VStack space="md">
            {infoContent.map((item, index) => (
              <View key={index} className="flex-row gap-2">
                <Text size="md" className="text-gray-600">•</Text>
                <Text size="md" className="flex-1 text-gray-600">
                  {item}
                </Text>
              </View>
            ))}
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
};
