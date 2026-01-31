/**
 * EditGroupScreen - Modal for editing group name and photo
 * Matches app's light theme styling
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input, InputField, InputSlot } from '@gluestack-ui/themed';

import { firestore, storage } from '@/config/firebase';
import type { RootStackParamList } from '@/types/navigation';

type EditGroupRouteProp = RouteProp<RootStackParamList, 'EditGroup'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const EditGroupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditGroupRouteProp>();
  const { chatId, currentName, currentPhotoURL } = route.params;

  const [groupName, setGroupName] = useState(currentName);
  const [photoURL, setPhotoURL] = useState<string | null>(currentPhotoURL);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null); // For newly selected images
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = groupName !== currentName || localImageUri !== null;
  const canSave = groupName.trim().length > 0 && hasChanges;

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert('Discard Changes?', 'You have unsaved changes.', [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      navigation.goBack();
    }
  }, [hasChanges, navigation]);

  // Upload image to Firebase Storage
  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `chats/${chatId}/avatar.jpg`);
    await uploadBytes(storageRef, blob);
    
    return await getDownloadURL(storageRef);
  };

  // Handle done
  const handleDone = useCallback(async () => {
    if (!canSave) return;

    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Prepare update data
      const updateData: Record<string, string> = {
        name: groupName.trim(),
      };

      // Upload image if a new one was selected
      if (localImageUri) {
        const downloadURL = await uploadImage(localImageUri);
        updateData.photoURL = downloadURL;
      }

      // Update group in Firestore
      await updateDoc(doc(firestore, 'chats', chatId), updateData);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('Error', 'Failed to update group. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [canSave, chatId, groupName, localImageUri, navigation]);

  // Handle add photo
  const handleAddPhoto = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri);
      setPhotoURL(result.assets[0].uri); // Show preview immediately
    }
  }, []);

  // Clear text
  const handleClearText = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGroupName('');
  }, []);

  // Get display image - either local selection or existing photo
  const displayImageUri = localImageUri || photoURL;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <Pressable
            onPress={handleCancel}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-base font-normal !text-gray-900">Cancel</Text>
          </Pressable>

          <Text className="text-lg font-semibold !text-gray-900">Edit group</Text>

          <Pressable
            onPress={handleDone}
            disabled={!canSave || isSaving}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              className={`text-base font-semibold ${
                canSave && !isSaving ? '!text-sky-500' : '!text-gray-400'
              }`}
            >
              {isSaving ? 'Saving...' : 'Done'}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View className="items-center flex-1 px-6 pt-10">
          {/* Group Photo */}
          <Pressable
            onPress={handleAddPhoto}
            className="items-center justify-center w-32 h-32 mb-4 overflow-hidden bg-green-500 rounded-full"
          >
            {displayImageUri ? (
              <Image
                source={{ uri: displayImageUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-4xl font-bold !text-white">
                {groupName.charAt(0).toUpperCase() || 'G'}
              </Text>
            )}
          </Pressable>

          {/* Add Photo Text */}
          <Pressable onPress={handleAddPhoto}>
            <Text className="mb-8 text-base font-medium !text-green-500">
              {displayImageUri ? 'Change photo' : 'Add photo'}
            </Text>
          </Pressable>

          {/* Group Name Input - Gluestack UI */}
          <Input
            size="lg"
            variant="outline"
            className="w-full bg-gray-100 border-0 rounded-xl"
          >
            <InputField
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name"
              placeholderTextColor="#9CA3AF"
              className="!text-gray-900"
              maxLength={50}
              autoFocus
            />
            {groupName.length > 0 && (
              <InputSlot onPress={handleClearText} className="pr-3">
                <View className="items-center justify-center w-5 h-5 bg-gray-300 rounded-full">
                  <X size={12} color="#6B7280" />
                </View>
              </InputSlot>
            )}
          </Input>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
