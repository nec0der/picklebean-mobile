/**
 * ImagePreviewSheet - Full screen image preview before sending
 * Options: Send with optional caption, or Cancel
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import type { ImageAttachment } from '@/types/chat';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImagePreviewSheetProps {
  isVisible: boolean;
  image: {
    uri: string;
    width: number;
    height: number;
  } | null;
  onSend: (image: ImageAttachment & { localUri: string; caption?: string }) => void;
  onCancel: () => void;
}

export const ImagePreviewSheet = memo(
  ({ isVisible, image, onSend, onCancel }: ImagePreviewSheetProps) => {
    const insets = useSafeAreaInsets();
    const [caption, setCaption] = useState('');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const sendButtonAnim = useRef(new Animated.Value(1)).current;

    // Reset caption when modal opens/closes
    useEffect(() => {
      if (!isVisible) {
        setCaption('');
      }
    }, [isVisible]);

    // Track keyboard visibility
    useEffect(() => {
      const showSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        () => setKeyboardVisible(true)
      );
      const hideSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => setKeyboardVisible(false)
      );
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    // Calculate image dimensions to fit screen - use most of available space
    const getImageDimensions = useCallback(() => {
      if (!image) return { width: SCREEN_WIDTH, height: SCREEN_WIDTH };

      const maxWidth = SCREEN_WIDTH - 16; // Minimal padding for larger display
      const maxHeight = SCREEN_HEIGHT * 0.65; // Use 65% of screen height
      const aspectRatio = image.width / image.height;

      let displayWidth = maxWidth;
      let displayHeight = displayWidth / aspectRatio;

      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = displayHeight * aspectRatio;
      }

      return { width: displayWidth, height: displayHeight };
    }, [image]);

    const dimensions = getImageDimensions();

    // Handle send
    const handleSend = useCallback(() => {
      if (!image) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Keyboard.dismiss();
      onSend({
        localUri: image.uri,
        url: '', // Will be set after upload
        width: image.width,
        height: image.height,
        caption: caption.trim() || undefined,
      });
      setCaption('');
    }, [image, onSend, caption]);

    // Handle cancel
    const handleCancel = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Keyboard.dismiss();
      setCaption('');
      onCancel();
    }, [onCancel]);

    if (!image) return null;

    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-black"
          style={{ paddingTop: insets.top }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <Pressable
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="items-center justify-center w-10 h-10 rounded-full bg-white/10"
            >
              <X size={24} color="#FFFFFF" />
            </Pressable>
            <Text className="text-lg font-semibold text-white">Preview</Text>
            <View className="w-10" />
          </View>

          {/* Image Preview - Tap to dismiss keyboard */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="items-center justify-center flex-1">
              <Image
                source={{ uri: image.uri }}
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                  borderRadius: 12,
                }}
                resizeMode="contain"
              />
            </View>
          </TouchableWithoutFeedback>

          {/* Bottom Input Area */}
          <View
            className="px-4 pt-3 bg-black/80"
            style={{ paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 16) }}
          >
            <View className="flex-row items-end gap-3">
              {/* Caption Input */}
              <View className="flex-1">
                <TextInput
                  ref={inputRef}
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Add a caption..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  className="px-4 text-white bg-white/10"
                  style={{
                    fontSize: 16,
                    minHeight: 44,
                    maxHeight: 100,
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderRadius: 22,
                  }}
                />
              </View>

              {/* Send Button */}
              <Pressable
                onPress={handleSend}
                className="items-center justify-center bg-blue-500 rounded-full"
                style={{ width: 44, height: 44 }}
              >
                <Send size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

ImagePreviewSheet.displayName = 'ImagePreviewSheet';

export type { ImagePreviewSheetProps };
