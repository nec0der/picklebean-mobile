import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Box, Heading, Button, ButtonText, VStack, Spinner } from '@gluestack-ui/themed';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import type { AuthStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { formatUsername } from '@/lib/username';

type UploadPhotoScreenProps = AuthStackScreenProps<'UploadPhoto'>;

export const UploadPhotoScreen = ({ navigation, route }: UploadPhotoScreenProps) => {
  const { username, password, gender } = route.params;
  const { signUpWithUsername } = useAuth();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload a photo');
      return;
    }

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

  const handleComplete = async (skipPhoto: boolean = false) => {
    try {
      setLoading(true);

      // Create account with all onboarding data
      await signUpWithUsername(username, password, gender, skipPhoto ? null : photoUri);

      // Navigation handled by auth state change
    } catch (error: any) {
      console.error('Error creating account:', error);
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="justify-center flex-1 px-6 bg-white">
      <VStack space="xl">
        {/* Header */}
        <VStack space="sm" className="items-center">
          <Heading size="3xl" className="text-center text-gray-900">
            Add Profile Photo
          </Heading>
          <Text className="text-lg text-center text-gray-600">
            Help others recognize you
          </Text>
        </VStack>

        {/* Photo Upload Area */}
        <View className="items-center mt-8">
          {photoUri ? (
            <TouchableOpacity onPress={pickImage} className="items-center">
              <Image
                source={{ uri: photoUri }}
                className="w-40 h-40 rounded-full"
                resizeMode="cover"
              />
              <Text className="mt-4 text-sm text-blue-600">Tap to change</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={pickImage}
              className="items-center justify-center w-40 h-40 bg-gray-100 border-2 border-gray-300 border-dashed rounded-full"
            >
              <Camera size={48} color="#9CA3AF" />
              <Text className="mt-2 text-sm text-gray-600">Add Photo</Text>
            </TouchableOpacity>
          )}

          <Text className="mt-6 text-sm text-center text-gray-500">
            Your username: {formatUsername(username)}
          </Text>
        </View>

        {/* Action Buttons */}
        <VStack space="md" className="mt-8">
          {photoUri ? (
            <Button
              size="lg"
              onPress={() => handleComplete(false)}
              isDisabled={loading}
              className="bg-green-600"
            >
              {loading ? <Spinner color="white" /> : <ButtonText>Complete</ButtonText>}
            </Button>
          ) : (
            <Button
              size="lg"
              onPress={pickImage}
              isDisabled={loading}
              className="bg-blue-600"
            >
              <ButtonText>Choose Photo</ButtonText>
            </Button>
          )}

          <TouchableOpacity
            onPress={() => handleComplete(true)}
            disabled={loading}
            className="p-4"
          >
            <Text className="font-semibold text-center text-gray-600">
              {photoUri ? 'Remove photo and continue' : 'Skip for now'}
            </Text>
          </TouchableOpacity>
        </VStack>
      </VStack>
    </Box>
  );
};
