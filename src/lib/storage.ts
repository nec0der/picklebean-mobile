/**
 * Firebase Storage utilities for file uploads
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

/**
 * Uploads a profile picture to Firebase Storage
 * @param userId - User ID
 * @param imageUri - Local image URI
 * @returns Download URL of uploaded image
 */
export const uploadProfilePicture = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create storage reference
    const filename = `profile_${userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `profile-pictures/${filename}`);

    // Upload the blob
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new Error('Failed to upload profile picture');
  }
};

/**
 * Uploads a generic image to Firebase Storage
 * @param path - Storage path (e.g., 'images/filename.jpg')
 * @param imageUri - Local image URI
 * @returns Download URL of uploaded image
 */
export const uploadImage = async (
  path: string,
  imageUri: string
): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Uploads a chat image to Firebase Storage
 * @param chatId - Chat ID
 * @param senderId - Sender's user ID
 * @param imageUri - Local image URI
 * @returns Download URL of uploaded image
 */
export const uploadChatImage = async (
  chatId: string,
  senderId: string,
  imageUri: string
): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create unique filename with timestamp
    const filename = `chat_${chatId}_${senderId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `chat-images/${chatId}/${filename}`);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading chat image:', error);
    throw new Error('Failed to upload chat image');
  }
};
