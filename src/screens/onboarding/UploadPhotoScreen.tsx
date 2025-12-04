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
import type { AuthStackScreenProps, OnboardingStackScreenProps } from "@/types/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/config/firebase";

type UploadPhotoScreenProps = 
  | AuthStackScreenProps<"UploadPhoto">
  | OnboardingStackScreenProps<"UploadPhoto">;

export const UploadPhotoScreen = ({
  navigation,
  route,
}: UploadPhotoScreenProps) => {
  const { username, gender } = route.params;
  const password = (route.params as any).password; // Optional for OAuth flow
  const oauthPhotoURL = (route.params as any).oauthPhotoURL; // Optional for OAuth flow
  const isOAuthFlow = !!oauthPhotoURL;
  
  const { signUpWithUsername, firebaseUser } = useAuth();

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
      } else if (password) {
        // Username/password flow: Create new account
        await signUpWithUsername(username, password, gender, photoUri);
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
      } else if (password) {
        // Username/password flow: Create account without photo
        await signUpWithUsername(username, password, gender, null);
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
          {/* Top Bar */}
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
              <Text className="text-lg font-semibold !text-blue-600">Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <VStack space="sm" className="mt-6">
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
                  className="w-48 h-48 rounded-full"
                />
              ) : (
                <View className="items-center justify-center w-48 h-48 border-2 border-gray-200 border-dashed rounded-full bg-gray-50">
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

        {/* Bottom Button */}
        <View className="pb-8 mt-8">
          <Button
            title={isOAuthFlow ? "Complete Setup" : "Complete"}
            size="md"
            onPress={handleContinue}
            disabled={loading}
            loading={loading}
            fullWidth
          />
        </View>
      </Box>

      {/* Selection ActionSheet */}
      <Actionsheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        snapPoints={[40]}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-8">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack
            space="xs"
            className="flex flex-col content-between flex-1 w-full pb-2 mt-4"
          >
            <View className="flex-1">
              <ActionsheetItem
                onPress={handleTakePhoto}
                className="rounded-lg active:bg-gray-100"
              >
                <Camera size={20} color="#374151" />
                <ActionsheetItemText className="ml-3 font-medium !text-gray-700">
                  Take Photo
                </ActionsheetItemText>
              </ActionsheetItem>

              <Divider className="my-1 bg-gray-100" />

              <ActionsheetItem
                onPress={handleChoosePhoto}
                className="rounded-lg active:bg-gray-100"
              >
                <ImageIcon size={20} color="#374151" />
                <ActionsheetItemText className="ml-3 font-medium !text-gray-700">
                  Choose from Library
                </ActionsheetItemText>
              </ActionsheetItem>

              {photoUri && (
                <>
                  <Divider className="my-1 bg-gray-100" />
                  <ActionsheetItem
                    onPress={handleRemovePhoto}
                    className="rounded-lg active:bg-red-50"
                  >
                    <Trash2 size={20} color="#EF4444" />
                    <ActionsheetItemText className="ml-3 font-medium !text-red-600">
                      Remove Photo
                    </ActionsheetItemText>
                  </ActionsheetItem>
                </>
              )}
            </View>

            <View className="mt-6">
              <Button
                title="Cancel"
                variant="secondary"
                size="md"
                onPress={() => setShowActionSheet(false)}
                fullWidth
              />
            </View>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>

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

          <Heading size="xl" className="mt-4 mb-6 !text-gray-900">
            Profile Photo
          </Heading>

          <VStack space="md">
            {infoContent.map((item, index) => (
              <View key={index} className="flex-row gap-2">
                <Text size="md" className="!text-gray-600">
                  •
                </Text>
                <Text size="md" className="flex-1 !text-gray-600">
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
