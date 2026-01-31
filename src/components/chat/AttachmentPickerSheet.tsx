/**
 * AttachmentPickerSheet - Bottom sheet for selecting attachment type
 * Options: Camera, Photo Library, Location
 */

import { memo, useCallback } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@gluestack-ui/themed';
import { Camera, Image, MapPin, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import type { ImageAttachment, LocationAttachment } from '@/types/chat';

interface RawImage {
  uri: string;
  width: number;
  height: number;
}

interface AttachmentPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (image: RawImage) => void;
  onLocationSelected: (location: LocationAttachment) => void;
}

export const AttachmentPickerSheet = memo(
  ({
    isOpen,
    onClose,
    onImageCaptured,
    onLocationSelected,
  }: AttachmentPickerSheetProps) => {
    // Handle camera capture
    const handleCamera = useCallback(async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();

      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera without editing - user can edit in preview
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImageCaptured({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        });
      }
    }, [onClose, onImageCaptured]);

    // Handle photo library selection
    const handlePhotoLibrary = useCallback(async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();

      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library access is needed to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker without editing - user can edit in preview
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onImageCaptured({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        });
      }
    }, [onClose, onImageCaptured]);

    // Handle location sharing
    const handleLocation = useCallback(async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location access is needed to share your location.',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Try to get address (reverse geocode)
        let address: string | undefined;
        try {
          const [reverseGeocode] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (reverseGeocode) {
            const parts = [
              reverseGeocode.street,
              reverseGeocode.city,
              reverseGeocode.region,
            ].filter(Boolean);
            address = parts.join(', ');
          }
        } catch (geoErr) {
          console.warn('Reverse geocode failed:', geoErr);
        }

        onLocationSelected({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address,
        });
      } catch (err) {
        console.error('Error getting location:', err);
        Alert.alert('Error', 'Could not get your current location.');
      }
    }, [onClose, onLocationSelected]);

    // Handle cancel
    const handleCancel = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    }, [onClose]);

    // Attachment option button
    const AttachmentOption = ({
      icon: Icon,
      label,
      color,
      bgColor,
      onPress,
    }: {
      icon: typeof Camera;
      label: string;
      color: string;
      bgColor: string;
      onPress: () => void;
    }) => (
      <Pressable
        onPress={onPress}
        className="items-center justify-center flex-1 py-4"
      >
        <View
          className="items-center justify-center mb-2 rounded-full w-14 h-14"
          style={{ backgroundColor: bgColor }}
        >
          <Icon size={26} color={color} />
        </View>
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
      </Pressable>
    );

    return (
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="pb-6 bg-white">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          {/* Title */}
          {/* <View className="w-full px-4 pt-2 pb-4">
            <Text className="text-lg font-semibold text-center text-gray-900">
              Share Attachment
            </Text>
          </View> */}

          {/* Options Row */}
          <View className="flex-row w-full px-4 my-4">
            <AttachmentOption
              icon={Camera}
              label="Camera"
              color="#3B82F6"
              bgColor="#DBEAFE"
              onPress={handleCamera}
            />
            <AttachmentOption
              icon={Image}
              label="Photos"
              color="#10B981"
              bgColor="#D1FAE5"
              onPress={handlePhotoLibrary}
            />
            <AttachmentOption
              icon={MapPin}
              label="Location"
              color="#EF4444"
              bgColor="#FEE2E2"
              onPress={handleLocation}
            />
          </View>

          {/* Cancel Button */}
          <View className="w-full px-4 mb-2">
            <Pressable
              onPress={handleCancel}
              className="py-3 bg-gray-100 rounded-xl"
            >
              <Text className="text-base font-semibold text-center text-gray-700">
                Cancel
              </Text>
            </Pressable>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    );
  }
);

AttachmentPickerSheet.displayName = 'AttachmentPickerSheet';

export type { AttachmentPickerSheetProps };
