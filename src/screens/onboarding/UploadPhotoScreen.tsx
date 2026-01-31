import { useState } from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Pressable,
} from "react-native";
import {
  Box,
  Heading,
  VStack,
  Text,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Divider,
} from "@gluestack-ui/themed";
import {
  ChevronLeft,
  Camera,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Plus,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/components/common/StepIndicator";
import type { AuthStackScreenProps, OnboardingStackScreenProps } from "@/types/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/config/firebase";

type UploadPhotoScreenProps = OnboardingStackScreenProps<"UploadPhoto">;

export const UploadPhotoScreen = ({
  navigation,
  route,
}: UploadPhotoScreenProps) => {
  const { username, gender } = route.params;
  const email = (route.params as any).email; // Optional - only for username signup
  const password = (route.params as any).password; // Optional for OAuth flow
  
  // Check if user is OAuth user by email domain
  const { signUpWithUsername, firebaseUser, userDocument } = useAuth();
  const { isOAuthUser } = require('@/lib/oauth');
  const isOAuthFlow = isOAuthUser(firebaseUser?.email);
  const oauthPhotoURL = userDocument?.photoURL || ''; // Get OAuth photo from user document

  const [photoUri, setPhotoUri] = useState<string | null>(oauthPhotoURL || null);
  const [loading, setLoading] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const infoContent = [
    "Help other players recognize you",
    "Makes the game more social and personal",
    "You can skip and add later",
    "Photos are visible on leaderboards and in lobbies",
  ];

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to upload a profile picture."
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    setShowActionSheet(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow camera access to take a photo."
      );
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
    setShowActionSheet(false);
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

  const handleRemovePhoto = () => {
    setShowActionSheet(false);
    setPhotoUri(null);
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      
      console.log('isOAuthFlow: ', isOAuthFlow);
      console.log('firebaseUser: ', firebaseUser);
      if (isOAuthFlow && firebaseUser) {
        // OAuth flow: Update existing user document
        const cleanUsername = username.startsWith('@') 
          ? username.slice(1).toLowerCase() 
          : username.toLowerCase();
        
        await updateDoc(doc(firestore, 'users', firebaseUser.uid), {
          username: cleanUsername,
          displayName: cleanUsername,
          gender,
          photoURL: photoUri || oauthPhotoURL || '',
          status: 'approved', // Complete onboarding
          updatedAt: new Date().toISOString(),
        });
        
        // Navigation will happen automatically when status changes to 'approved'
      } else if (password && email) {
        // Username/password flow: Create new account with real email
        await signUpWithUsername(email, username, password, gender, photoUri);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert("Error", "Failed to complete setup. Please try again.");
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      
      if (isOAuthFlow && firebaseUser) {
        // OAuth flow: Complete onboarding with OAuth photo
        const cleanUsername = username.startsWith('@') 
          ? username.slice(1).toLowerCase() 
          : username.toLowerCase();
        
        await updateDoc(doc(firestore, 'users', firebaseUser.uid), {
          username: cleanUsername,
          displayName: cleanUsername,
          gender,
          photoURL: oauthPhotoURL || '',
          status: 'approved', // Complete onboarding
          updatedAt: new Date().toISOString(),
        });
      } else if (password && email) {
        // Username/password flow: Create account without photo
        await signUpWithUsername(email, username, password, gender, null);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert("Error", "Failed to complete setup. Please try again.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 px-6">
        <View>
          {/* Top Row - Back Button, Step Indicator, and Skip */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2 -ml-2"
            >
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
            
            <StepIndicator 
              currentStep={email && password ? 5 : 4} 
              totalSteps={email && password ? 5 : 4} 
            />

            <TouchableOpacity
              onPress={handleSkip}
              disabled={loading}
              className="p-2 -mr-2"
            >
              <Text className="text-base font-semibold !text-blue-600">Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <VStack space="sm">
            <Heading size="2xl" className="!text-gray-900">
              Add Profile Photo
            </Heading>
            <View className="flex-row flex-wrap items-center gap-1">
              <Text size="md" className="!text-gray-600">
                Help others recognize you on the court.{" "}
              </Text>
              <TouchableOpacity onPress={() => setShowInfo(true)}>
                <Text size="md" className="!text-blue-600">
                  Why add a photo?
                </Text>
              </TouchableOpacity>
            </View>
          </VStack>

          {/* Avatar Area */}
          <View className="items-center mt-12">
            <Pressable
              onPress={() => setShowActionSheet(true)}
              disabled={loading}
              className="relative"
            >
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  className="w-56 h-56 rounded-full"
                />
              ) : (
                <View className="items-center justify-center w-56 h-56 border-2 border-gray-200 border-dashed rounded-full bg-gray-50">
                  <Camera size={40} color="#9CA3AF" />
                </View>
              )}

              {/* Edit Badge */}
              <View className="absolute p-3 bg-blue-600 border-4 border-white rounded-full shadow-sm bottom-2 right-2">
                {photoUri ? (
                  <Edit2 size={20} color="white" />
                ) : (
                  <Plus size={20} color="white" />
                )}
              </View>
            </Pressable>

            <Text
              size="sm"
              className="mt-4 !text-gray-500 text-center font-medium"
            >
              {photoUri 
                ? isOAuthFlow && photoUri === oauthPhotoURL
                  ? "Tap to update your photo"
                  : "Tap to change photo"
                : "Tap to upload a photo"}
            </Text>
          </View>
        </View>

        {/* Bottom Button - Only show when photo is uploaded */}
        {photoUri && photoUri !== oauthPhotoURL && (
          <View className="pb-8 mt-8">
            <Button
              title="Complete Setup"
              size="md"
              onPress={handleContinue}
              disabled={loading}
              loading={loading}
              fullWidth
            />
          </View>
        )}
      </Box>

      {/* Selection ActionSheet */}
      <Actionsheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-0 pb-8">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="w-full py-6">
            {/* Action Buttons */}
            <View className="px-2">
              {/* Take Photo */}
              <Pressable
                onPress={handleTakePhoto}
                className="flex-row items-center gap-3 px-4 py-4 rounded-lg active:bg-gray-50"
              >
                <Camera size={20} color="#1F2937" />
                <Text className="text-base font-medium !text-gray-900">
                  Take Photo
                </Text>
              </Pressable>

              {/* Choose from Library */}
              <Pressable
                onPress={handleChoosePhoto}
                className="flex-row items-center gap-3 px-4 py-4 mt-2 rounded-lg active:bg-gray-50"
              >
                <ImageIcon size={20} color="#1F2937" />
                <Text className="text-base font-medium !text-gray-900">
                  Choose from Library
                </Text>
              </Pressable>

              {/* Remove Photo - Conditional */}
              {photoUri && (
                <Pressable
                  onPress={handleRemovePhoto}
                  className="flex-row items-center gap-3 px-4 py-4 mt-2 rounded-lg active:bg-red-50"
                >
                  <Trash2 size={20} color="#DC2626" />
                  <Text className="text-base font-medium !text-red-600">
                    Remove Photo
                  </Text>
                </Pressable>
              )}
            </View>

            <Divider className="my-4" />

            {/* Close Button */}
            <View className="px-4">
              <Button
                title="Close"
                variant="subtle"
                size="md"
                onPress={() => setShowActionSheet(false)}
                fullWidth
              />
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>

      {/* Info Actionsheet */}
      <Actionsheet
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        // snapPoints={[80]}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-6 pt-4 pb-12">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <Heading size="xl" className="mt-4 mb-12 !text-gray-900">
            Profile Photo
          </Heading>

          <VStack space="md" className="mb-20">
            {infoContent.map((item, index) => (
              <View key={index} className="flex-row gap-2 p-0">
                <Text size="md" className="!text-gray-600">
                  •
                </Text>
                <Text size="md" className="!text-gray-600">
                  {item}
                </Text>
              </View>
            ))}
          </VStack>

          {/* Close Button */}
          <Button
            title="Got It"
            size="md"
            onPress={() => setShowInfo(false)}
            fullWidth
          />
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
};
