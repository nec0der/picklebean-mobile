import { memo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Smartphone, Zap } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNFCWriter } from '@/hooks/common/useNFCWriter';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const ProgramPaddleScreen = memo(
  ({ navigation }: RootStackScreenProps<'ProgramPaddle'>) => {
    const { userDocument } = useAuth();
    const { isWriting, writeProfileUrl } = useNFCWriter();
    const [hasStarted, setHasStarted] = useState(false);

    const handleBack = () => {
      if (!isWriting) {
        navigation.goBack();
      }
    };

    const handleStartWriting = async () => {
      if (!userDocument?.username) return;

      setHasStarted(true);
      const profileUrl = `https://picklebean-ranking-app.web.app/profile/${userDocument.username}`;
      const success = await writeProfileUrl(profileUrl);

      if (success) {
        // Navigate back on success
        navigation.goBack();
      } else {
        // Reset on failure so user can try again
        setHasStarted(false);
      }
    };

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Header with back button */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <Pressable
            onPress={handleBack}
            className="mr-3"
            disabled={isWriting}
          >
            <ArrowLeft size={24} color={isWriting ? '#9CA3AF' : '#000'} />
          </Pressable>
          <Text className="text-lg font-semibold !text-gray-900">
            Program Paddle
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="p-6"
        >
          {!hasStarted ? (
            <>
              {/* Introduction */}
              <Text className="mb-6 text-base !text-gray-700">
                Program your paddle's NFC tag so others can tap to view your
                profile instantly at the court.
              </Text>

              {/* Instructions */}
              <View className="mb-8">
                {/* Step 1 */}
                <View className="flex-row mb-4">
                  <View className="items-center justify-center w-10 h-10 mr-4 bg-blue-100 rounded-full">
                    <Text className="text-lg font-bold !text-blue-600">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-semibold !text-gray-900">
                      Get your paddle ready
                    </Text>
                    <Text className="text-base !text-gray-600">
                      Locate the NFC tag on your paddle (usually on the handle)
                    </Text>
                  </View>
                </View>

                {/* Step 2 */}
                <View className="flex-row mb-4">
                  <View className="items-center justify-center w-10 h-10 mr-4 bg-blue-100 rounded-full">
                    <Text className="text-lg font-bold !text-blue-600">2</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-semibold !text-gray-900">
                      Tap "Start Writing"
                    </Text>
                    <Text className="text-base !text-gray-600">
                      Your phone will prepare to write to the tag
                    </Text>
                  </View>
                </View>

                {/* Step 3 */}
                <View className="flex-row mb-4">
                  <View className="items-center justify-center w-10 h-10 mr-4 bg-blue-100 rounded-full">
                    <Text className="text-lg font-bold !text-blue-600">3</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-semibold !text-gray-900">
                      Hold phone to paddle
                    </Text>
                    <Text className="text-base !text-gray-600">
                      Keep steady until you see the success message
                    </Text>
                  </View>
                </View>
              </View>

              {/* Platform-specific note */}
              <View className="p-4 mb-8 rounded-lg bg-blue-50">
                <View className="flex-row items-start">
                  <Smartphone size={24} color="#3B82F6" className="mt-0.5 mr-3" />
                  <Text className="flex-1 !text-blue-900">
                    {Platform.OS === 'ios'
                      ? 'On iPhone, hold the top of your phone near the NFC tag'
                      : 'Hold the back of your phone near the NFC tag'}
                  </Text>
                </View>
              </View>

              {/* Start Writing Button */}
              <Pressable
                onPress={handleStartWriting}
                className="items-center justify-center px-6 py-4 bg-blue-600 rounded-xl"
              >
                <View className="flex-row items-center">
                  <Zap size={20} color="#FFFFFF" className="mr-2" />
                  <Text className="text-lg font-semibold !text-white">
                    Start Writing
                  </Text>
                </View>
              </Pressable>
            </>
          ) : (
            /* Writing State */
            <View className="items-center py-12">
              <View className="mb-6">
                <LoadingSpinner size="large" />
              </View>

              <Text className="mb-3 text-2xl font-bold text-center !text-gray-900">
                Hold Phone to Paddle
              </Text>

              <Text className="mb-8 text-center !text-gray-600">
                Keep your phone steady near the NFC tag...
              </Text>

              <View className="w-full p-4 rounded-lg bg-amber-50">
                <View className="flex-row items-start">
                  <Zap size={24} color="#F59E0B" className="mt-0.5 mr-3" />
                  <Text className="flex-1 !text-amber-900">
                    Don't move your phone until the process completes
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
);

ProgramPaddleScreen.displayName = 'ProgramPaddleScreen';
