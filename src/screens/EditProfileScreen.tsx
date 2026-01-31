import { memo, useCallback, useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Camera, ChevronRight } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfilePicture } from '@/lib/storage';
import { updateUserProfile } from '@/services/userService';
import { ScreenHeader, LoadingSpinner } from '@/components/common';
import { useToast } from '@/hooks/common/useToast';

export const EditProfileScreen = memo(({ navigation }: RootStackScreenProps<'EditProfile'>) => {
  const { userDocument } = useAuth();
  const toast = useToast();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Block navigation while photo is uploading
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isUploadingPhoto) {
        return; // Allow navigation
      }
      
      // Prevent navigation
      e.preventDefault();
      toast.error('Please wait while photo is uploading');
    });

    return unsubscribe;
  }, [navigation, isUploadingPhoto, toast]);

  const handleBack = () => {
    if (isUploadingPhoto) {
      toast.error('Please wait while photo is uploading');
      return;
    }
    navigation.goBack();
  };

  const handlePickImage = useCallback(async () => {
    if (!userDocument?.uid || isUploadingPhoto) return;

    try {
      // Request permission
      const { status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        toast.error('Permission needed to access photos');
        return;
      }

      // Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsUploadingPhoto(true);
        
        try {
          // Upload and update immediately
          const profilePictureUrl = await uploadProfilePicture(userDocument.uid, result.assets[0].uri);
          await updateUserProfile(userDocument.uid, { profilePictureUrl });
          
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success('Photo updated');
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error('Failed to upload photo');
        } finally {
          setIsUploadingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Failed to pick image');
    }
  }, [userDocument, toast, isUploadingPhoto]);

  if (!userDocument) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <LoadingSpinner size="large" />
      </View>
    );
  }

  const profilePictureUri = userDocument.profilePictureUrl || userDocument.photoURL;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader 
        title="Edit Profile" 
        onLeftPress={isUploadingPhoto ? undefined : handleBack}
      />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View className="items-center py-6 border-b border-gray-200">
          <View className="relative">
            {profilePictureUri ? (
              <Image
                source={{ uri: profilePictureUri }}
                className="w-32 h-32 bg-gray-200 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-24 h-24 bg-gray-200 rounded-full">
                <Text className="text-3xl font-bold !text-gray-400">
                  {userDocument.displayName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}

            {/* Loading Overlay */}
            {isUploadingPhoto && (
              <View className="absolute inset-0 items-center justify-center rounded-full bg-black/50">
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}

            {/* Change Photo Button */}
            <Pressable
              onPress={handlePickImage}
              disabled={isUploadingPhoto}
              className={`absolute bottom-0 right-0 p-2 rounded-full ${
                isUploadingPhoto 
                  ? 'bg-gray-400' 
                  : 'bg-green-500 active:bg-green-600'
              }`}
            >
              <Camera size={16} color="white" />
            </Pressable>
          </View>

          <Text className="mt-3 text-sm !text-gray-500">
            {isUploadingPhoto ? 'Uploading photo...' : 'Tap to change photo'}
          </Text>
        </View>

        {/* Navigation List */}
        <View className="">
          {/* Display Name */}
          <Pressable
            onPress={() => navigation.navigate('EditDisplayName', { 
              currentDisplayName: userDocument.displayName || '' 
            })}
            className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="flex-1">
              <Text className="mb-1 text-sm !text-gray-500">Display Name</Text>
              <Text className="text-base !text-gray-900">
                {userDocument.displayName || 'Not set'}
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </Pressable>

          {/* Bio */}
          <Pressable
            onPress={() => navigation.navigate('EditBio', { 
              currentBio: userDocument.bio 
            })}
            className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="flex-1 pr-4">
              <Text className="mb-1 text-sm !text-gray-500">Bio</Text>
              <Text 
                className="text-base !text-gray-900"
                numberOfLines={2}
              >
                {userDocument.bio || 'Tell us about yourself'}
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </Pressable>

          {/* Username */}
          <Pressable
            onPress={() => navigation.navigate('EditUsername', { 
              currentUsername: userDocument.username 
            })}
            className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <View className="flex-1">
              <Text className="mb-1 text-sm !text-gray-500">Username</Text>
              <Text className="text-base !text-gray-900">
                @{userDocument.username}
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </Pressable>

          {/* Gender */}
          <Pressable
            onPress={() => navigation.navigate('EditGender', { 
              currentGender: userDocument.gender 
            })}
            className="flex-row items-center justify-between px-6 py-4 active:bg-gray-50"
          >
            <View className="flex-1">
              <Text className="mb-1 text-sm !text-gray-500">Gender</Text>
              <Text className="text-base !text-gray-900 capitalize">
                {userDocument.gender}
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

EditProfileScreen.displayName = 'EditProfileScreen';
