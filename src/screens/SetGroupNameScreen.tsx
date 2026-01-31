/**
 * SetGroupNameScreen - Step 2: Group details (name, picture, confirm participants)
 * Features:
 * - WhatsApp-style group photo + name row
 * - Photo ActionSheet (Take/Choose/Reset)
 * - Grid layout for participants
 * - Participant removal with circular X (except current user)
 * - Add button to add more participants
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Keyboard,
  Alert,
  ActivityIndicator,
  TextInput,
  ActionSheetIOS,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft, Camera, X, Plus, Pencil } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetItem, ActionsheetItemText, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper } from '@gluestack-ui/themed';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { createGroupChat } from '@/services/chatService';
import type { RootStackParamList } from '@/types/navigation';
import type { ChatParticipant } from '@/types/chat';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SetGroupNameRouteProp = RouteProp<RootStackParamList, 'SetGroupName'>;

interface SelectedUser {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string | null;
}

export const SetGroupNameScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SetGroupNameRouteProp>();
  const { userDocument } = useAuth();
  
  // Local state for participants (removable)
  const [participants, setParticipants] = useState<SelectedUser[]>(route.params.selectedUsers);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  
  // Validate group name
  const trimmedName = groupName.trim();
  const isValidName = trimmedName.length >= 1;
  const canCreate = isValidName && !creating;
  
  // Total participants including current user
  const totalParticipants = participants.length + 1;
  
  // Handle back navigation
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  
  // Handle photo picker
  const handlePickImage = useCallback(async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant permission to access your photos.');
        return;
      }
      
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
      
      if (!result.canceled && result.assets[0]) {
        setGroupImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }, []);
  
  // Handle photo action
  const handlePhotoPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (Platform.OS === 'ios') {
      const options = groupImage
        ? ['Take Photo', 'Choose Photo', 'Reset Photo', 'Cancel']
        : ['Take Photo', 'Choose Photo', 'Cancel'];
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: groupImage ? 2 : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) handlePickImage(true);
          else if (buttonIndex === 1) handlePickImage(false);
          else if (buttonIndex === 2 && groupImage) setGroupImage(null);
        }
      );
    } else {
      setShowActionSheet(true);
    }
  }, [groupImage, handlePickImage]);
  
  // Remove participant
  const handleRemoveParticipant = useCallback((uid: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setParticipants((prev) => prev.filter((p) => p.uid !== uid));
  }, []);
  
  // Navigate to add more participants
  const handleAddMore = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate back to CreateGroupScreen with current selections
    navigation.goBack();
  }, [navigation]);
  
  // Create group chat
  const handleCreate = useCallback(async () => {
    if (!canCreate || !userDocument) return;
    
    try {
      setCreating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Keyboard.dismiss();
      
      // Build participants array including current user
      const chatParticipants: ChatParticipant[] = [
        {
          userId: userDocument.uid,
          username: userDocument.username,
          displayName: userDocument.displayName,
          photoURL: userDocument.profilePictureUrl || null,
        },
        ...participants.map((user) => ({
          userId: user.uid,
          username: user.username,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })),
      ];
      
      // Create group chat
      // TODO: Upload group image to Firebase Storage if set
      const chatId = await createGroupChat(trimmedName, chatParticipants);
      
      // Navigate to the new group chat, resetting stack
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Tabs' },
          { name: 'ChatDetail', params: { chatId } },
        ],
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert(
        'Error',
        'Failed to create group. Please try again.',
        [{ text: 'OK' }]
      );
      setCreating(false);
    }
  }, [canCreate, userDocument, participants, trimmedName, navigation]);
  
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Pressable
          onPress={handleGoBack}
          className="p-1 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={creating}
        >
          <ChevronLeft size={28} color={creating ? '#9CA3AF' : '#374151'} />
        </Pressable>
        
        <Text className="text-lg font-semibold !text-gray-900">
          New group
        </Text>
        
        {/* Create button - rounded-full style */}
        <Pressable
          onPress={handleCreate}
          disabled={!canCreate}
          className={`px-5 py-2 rounded-full ${
            canCreate ? 'bg-blue-500 active:bg-blue-600' : 'bg-gray-300'
          }`}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className={`font-semibold ${canCreate ? '!text-white' : '!text-gray-500'}`}>
              Create
            </Text>
          )}
        </Pressable>
      </View>
      
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Group Photo + Name Row (WhatsApp Style) */}
        <View className="flex-row items-center px-4 py-4 mx-4 mt-4 bg-gray-100 rounded-2xl">
          {/* Photo Button */}
          <Pressable
            onPress={handlePhotoPress}
            className="items-center justify-center w-16 h-16 mr-4 overflow-hidden bg-green-500 rounded-full"
            disabled={creating}
          >
            {groupImage ? (
              <Image
                source={{ uri: groupImage }}
                className="w-16 h-16"
                resizeMode="cover"
              />
            ) : (
              <Camera size={28} color="#FFFFFF" />
            )}
          </Pressable>
          
          {/* Name Input with Pencil icon */}
          <View className="flex-row items-center flex-1">
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Type group name here..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base !text-gray-900"
              returnKeyType="done"
              onSubmitEditing={handleCreate}
              editable={!creating}
              autoFocus
            />
            {groupName.length > 0 && (
              <Pressable
                onPress={() => setGroupName('')}
                className="items-center justify-center w-6 h-6 bg-gray-400 rounded-full"
                disabled={creating}
              >
                <X size={14} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
        </View>
        
        {/* Participants Section */}
        <View className="mt-6">
          <Text className="px-4 mb-4 text-sm font-semibold tracking-wide !text-gray-500">
            MEMBERS: {totalParticipants}
          </Text>
          
          {/* Participants Grid */}
          <View className="flex-row flex-wrap px-4">
            {/* Add Button */}
            <Pressable
              onPress={handleAddMore}
              className="items-center mb-4 mr-4"
              style={{ width: 64 }}
              disabled={creating}
            >
              <View className="items-center justify-center bg-green-500 rounded-full w-14 h-14">
                <Plus size={28} color="#FFFFFF" />
              </View>
              <Text className="mt-2 text-xs !text-gray-600" numberOfLines={1}>
                Add
              </Text>
            </Pressable>
            
            {/* Current User (You) - NOT removable */}
            <View className="items-center mb-4 mr-4" style={{ width: 64 }}>
              <Avatar
                uri={userDocument?.profilePictureUrl}
                name={userDocument?.displayName || 'You'}
                size="md"
              />
              <Text className="mt-2 text-xs !text-gray-600" numberOfLines={1}>
                You
              </Text>
            </View>
            
            {/* Selected Participants - Removable with X badge */}
            {participants.map((user) => (
              <View key={user.uid} className="relative items-center mb-4 mr-4" style={{ width: 64 }}>
                <View>
                  <Avatar
                    uri={user.photoURL}
                    name={user.displayName}
                    size="md"
                  />
                  {/* Remove badge */}
                  <Pressable
                    onPress={() => handleRemoveParticipant(user.uid)}
                    className="absolute items-center justify-center bg-gray-500 border-2 border-white rounded-full w-7 h-7"
                    style={{ top: -4, right: -4 }}
                    disabled={creating}
                  >
                    <X size={14} color="#FFFFFF" strokeWidth={2.5} />
                  </Pressable>
                </View>
                <Text className="mt-2 text-xs !text-gray-600" numberOfLines={1}>
                  {user.displayName.split(' ')[0]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Android ActionSheet */}
      <Actionsheet isOpen={showActionSheet} onClose={() => setShowActionSheet(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          
          <ActionsheetItem onPress={() => { setShowActionSheet(false); handlePickImage(true); }}>
            <ActionsheetItemText>Take Photo</ActionsheetItemText>
          </ActionsheetItem>
          
          <ActionsheetItem onPress={() => { setShowActionSheet(false); handlePickImage(false); }}>
            <ActionsheetItemText>Choose Photo</ActionsheetItemText>
          </ActionsheetItem>
          
          {groupImage && (
            <ActionsheetItem onPress={() => { setShowActionSheet(false); setGroupImage(null); }}>
              <ActionsheetItemText className="!text-red-500">Reset Photo</ActionsheetItemText>
            </ActionsheetItem>
          )}
          
          <ActionsheetItem onPress={() => setShowActionSheet(false)}>
            <ActionsheetItemText>Cancel</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
