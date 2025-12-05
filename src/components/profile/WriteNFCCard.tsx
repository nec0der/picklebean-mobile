import { memo } from 'react';
import { View, Text, Modal, Pressable, Platform } from 'react-native';
import { X, Smartphone, Zap } from 'lucide-react-native';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface WriteNFCCardProps {
  visible: boolean;
  isWriting: boolean;
  onClose: () => void;
  onWrite: () => void;
}

/**
 * Modal card for NFC writing flow
 * Shows instructions and handles the write process
 */
export const WriteNFCCard = memo(
  ({ visible, isWriting, onClose, onWrite }: WriteNFCCardProps) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="items-center justify-center flex-1 bg-black/50">
          <View className="w-11/12 max-w-md p-6 mx-4 bg-white rounded-2xl">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold !text-gray-900">
                Program Paddle
              </Text>
              {!isWriting && (
                <Pressable
                  onPress={onClose}
                  className="items-center justify-center w-8 h-8 bg-gray-100 rounded-full"
                >
                  <X size={20} color="#6B7280" />
                </Pressable>
              )}
            </View>

            {!isWriting ? (
              <>
                {/* Instructions */}
                <View className="mb-6">
                  <Text className="mb-4 text-base !text-gray-700">
                    Program your paddle's NFC tag so others can tap to view your
                    profile.
                  </Text>

                  {/* Step 1 */}
                  <View className="flex-row mb-3">
                    <View className="items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full">
                      <Text className="font-bold !text-blue-600">1</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold !text-gray-900">
                        Get your paddle ready
                      </Text>
                      <Text className="text-sm !text-gray-600">
                        Locate the NFC tag on your paddle (usually on the handle)
                      </Text>
                    </View>
                  </View>

                  {/* Step 2 */}
                  <View className="flex-row mb-3">
                    <View className="items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full">
                      <Text className="font-bold !text-blue-600">2</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold !text-gray-900">
                        Tap "Start Writing"
                      </Text>
                      <Text className="text-sm !text-gray-600">
                        Your phone will prepare to write to the tag
                      </Text>
                    </View>
                  </View>

                  {/* Step 3 */}
                  <View className="flex-row">
                    <View className="items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full">
                      <Text className="font-bold !text-blue-600">3</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold !text-gray-900">
                        Hold phone to paddle
                      </Text>
                      <Text className="text-sm !text-gray-600">
                        Keep steady until you see the success message
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Platform-specific note */}
                <View className="p-3 mb-6 rounded-lg bg-blue-50">
                  <View className="flex-row items-start">
                    <Smartphone size={20} color="#3B82F6" className="mt-0.5 mr-2" />
                    <Text className="flex-1 text-sm !text-blue-900">
                      {Platform.OS === 'ios'
                        ? 'On iPhone, hold the top of your phone near the NFC tag'
                        : 'Hold the back of your phone near the NFC tag'}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={onClose}
                    className="items-center justify-center flex-1 px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <Text className="font-semibold !text-gray-700">Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={onWrite}
                    className="items-center justify-center flex-1 px-4 py-3 bg-blue-600 rounded-xl"
                  >
                    <View className="flex-row items-center">
                      <Zap size={18} color="#FFFFFF" className="mr-2" />
                      <Text className="font-semibold !text-white">
                        Start Writing
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </>
            ) : (
              /* Writing State */
              <View className="items-center py-8">
                <View className="mb-4">
                  <LoadingSpinner size="large" />
                </View>

                <Text className="mb-2 text-xl font-bold text-center !text-gray-900">
                  Hold Phone to Paddle
                </Text>

                <Text className="mb-6 text-center !text-gray-600">
                  Keep your phone steady near the NFC tag...
                </Text>

                <View className="p-4 rounded-lg bg-amber-50">
                  <View className="flex-row items-start">
                    <Zap size={20} color="#F59E0B" className="mt-0.5 mr-2" />
                    <Text className="flex-1 text-sm !text-amber-900">
                      Don't move your phone until the process completes
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }
);

WriteNFCCard.displayName = 'WriteNFCCard';

export type { WriteNFCCardProps };
