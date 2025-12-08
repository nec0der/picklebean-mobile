import { memo, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Smartphone, Zap, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNFCWriter } from '@/hooks/common/useNFCWriter';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type ScreenState = 'intro' | 'writing' | 'success';

export const TapToPlayScreen = memo(
  ({ navigation }: RootStackScreenProps<'ProgramPaddle'>) => {
    const { userDocument } = useAuth();
    const { isWriting, writeProfileUrl, cancelWrite } = useNFCWriter();
    const [screenState, setScreenState] = useState<ScreenState>('intro');

    const handleBack = useCallback(async () => {
      if (isWriting) {
        // Cancel NFC scan in progress
        await cancelWrite();
        setScreenState('intro');
      }
      navigation.goBack();
    }, [isWriting, cancelWrite, navigation]);

    const handleStartWriting = async () => {
      if (!userDocument?.username) return;

      setScreenState('writing');
      const profileUrl = `https://picklebean-ranking-app.web.app/profile/${userDocument.username}`;
      const success = await writeProfileUrl(profileUrl);

      if (success) {
        // Haptic feedback on success
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } catch (error) {
          // Haptics might not be available, silently fail
        }
        setScreenState('success');
      } else {
        // Reset on failure or cancellation
        setScreenState('intro');
      }
    };

    const handleCancelScan = useCallback(async () => {
      await cancelWrite();
      setScreenState('intro');
    }, [cancelWrite]);

    const handleDone = () => {
      navigation.goBack();
    };

    const handleProgramAnother = () => {
      setScreenState('intro');
    };

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* iOS-style Navigation Bar */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-200">
          <Pressable
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="flex-row items-center"
          >
            <ArrowLeft size={22} color="#007AFF" />
            <Text className="ml-1 text-base !text-[#007AFF]">Back</Text>
          </Pressable>
          <Text className="text-base font-semibold !text-gray-900">
            Tap to Play
          </Text>
          <View className="w-16" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 py-6"
        >
          {screenState === 'intro' && (
            <>
              {/* Large Title - HIG 34pt */}
              <Text className="mb-2 text-4xl font-bold !text-gray-900">
                Stop Asking. Start Playing.
              </Text>
              
              {/* Body Text - HIG 17pt */}
              <Text className="mb-8 text-lg leading-6 !text-gray-600">
                Make your paddle tap-enabled. Walk up to any game. Tap in.
                Your stats do the talking.
              </Text>

              {/* Section Header - HIG 22pt */}
              <Text className="mb-5 text-2xl font-bold !text-gray-900">
                Why This Matters
              </Text>

              {/* Benefit Cards with HIG spacing */}
              <View className="mb-5">
                <Text className="mb-2 text-lg font-semibold !text-gray-900">
                  No More Skill Checks
                </Text>
                <Text className="text-base leading-6 !text-gray-600">
                  "What's your rating?" answered before you say a word. Your
                  record is visible instantly.
                </Text>
              </View>

              <View className="mb-5">
                <Text className="mb-2 text-lg font-semibold !text-gray-900">
                  Phone Stays in Your Bag
                </Text>
                <Text className="text-base leading-6 !text-gray-600">
                  Play 5 games back-to-back without touching your phone. Paddle
                  tap = you're in.
                </Text>
              </View>

              <View className="mb-8">
                <Text className="mb-2 text-lg font-semibold !text-gray-900">
                  Walk Up to Any Court
                </Text>
                <Text className="text-base leading-6 !text-gray-600">
                  New city? No problem. Your reputation travels with you. Tap
                  and play anywhere.
                </Text>
              </View>

              {/* Section Header */}
              <Text className="mb-5 text-2xl font-bold !text-gray-900">
                How It Works
              </Text>
              
              <Text className="mb-5 text-base leading-6 !text-gray-600">
                Get a blank NFC tag (sticker or keychain). Program it once. Use
                it forever.
              </Text>

              {/* Info Card - HIG rounded style */}
              <View className="p-4 mb-8 rounded-2xl bg-[#F2F2F7]">
                <View className="flex-row items-start">
                  <Smartphone
                    size={20}
                    color="#007AFF"
                    className="mt-0.5 mr-3"
                  />
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-semibold !text-gray-900">
                      {Platform.OS === 'ios'
                        ? 'iPhone: NFC at top edge'
                        : 'Android: NFC at center back'}
                    </Text>
                    <Text className="text-sm leading-5 !text-gray-600">
                      Hold your phone near the NFC tag for 2-3 seconds
                    </Text>
                  </View>
                </View>
              </View>

              {/* Primary Button - HIG style */}
              <Pressable
                onPress={handleStartWriting}
                className="items-center justify-center py-4 rounded-2xl bg-[#007AFF] active:bg-[#0051D5]"
              >
                <View className="flex-row items-center">
                  <Zap size={20} color="#FFFFFF" className="mr-2" />
                  <Text className="text-lg font-semibold !text-white">
                    Make Paddle Tap-Enabled
                  </Text>
                </View>
              </Pressable>
            </>
          )}

          {screenState === 'writing' && (
            /* Writing State - With Cancel Button */
            <View className="items-center py-12">
              {/* Large Title */}
              <Text className="mb-8 text-3xl font-bold text-center !text-gray-900">
                Ready to Scan
              </Text>

              {/* Loading Spinner */}
              <View className="mb-8">
                <LoadingSpinner size="large" />
              </View>

              {/* Body Text */}
              <Text className="mb-8 text-base text-center leading-6 !text-gray-600">
                Hold your {Platform.OS === 'ios' ? 'iPhone' : 'phone'} near the
                NFC tag
              </Text>

              {/* Info Card */}
              <View className="w-full p-4 mb-8 rounded-2xl bg-[#F2F2F7]">
                <View className="flex-row items-start">
                  <Smartphone
                    size={20}
                    color="#007AFF"
                    className="mt-0.5 mr-3"
                  />
                  <Text className="flex-1 text-sm leading-5 !text-gray-600">
                    {Platform.OS === 'ios'
                      ? 'Hold top of phone to tag'
                      : 'Hold back center of phone to tag'}
                  </Text>
                </View>
              </View>

              {/* Cancel Button - Prominent and always visible */}
              <Pressable
                onPress={handleCancelScan}
                className="w-full py-4 rounded-2xl bg-[#F2F2F7] active:bg-[#E5E5EA]"
              >
                <Text className="text-lg font-semibold text-center !text-gray-900">
                  Cancel
                </Text>
              </Pressable>
            </View>
          )}

          {screenState === 'success' && (
            /* Success State */
            <View className="items-center py-8">
              {/* Success Icon - HIG style */}
              <View className="items-center justify-center w-24 h-24 mb-6 bg-[#34C759]/10 rounded-full">
                <CheckCircle size={56} color="#34C759" />
              </View>

              {/* Title 1 - HIG 28pt */}
              <Text className="mb-3 text-3xl font-bold text-center !text-gray-900">
                You're Tap-Enabled!
              </Text>

              {/* Body Text */}
              <Text className="mb-8 text-base text-center leading-6 !text-gray-600">
                Your paddle is ready. Walk up to any game. Tap in. Start
                playing.
              </Text>

              {/* Info Card */}
              <View className="w-full p-4 mb-8 rounded-2xl bg-[#F2F2F7]">
                <Text className="mb-3 font-semibold !text-gray-900">
                  How Others Use It:
                </Text>
                <View className="space-y-2">
                  <Text className="text-sm leading-5 !text-gray-600">
                    • They tap your paddle with their phone
                  </Text>
                  <Text className="text-sm leading-5 !text-gray-600">
                    • Your profile opens instantly
                  </Text>
                  <Text className="text-sm leading-5 !text-gray-600">
                    • They add you to their game
                  </Text>
                  <Text className="text-sm leading-5 !text-gray-600">
                    • Match gets tracked automatically
                  </Text>
                </View>
              </View>

              {/* Primary Button */}
              <Pressable
                onPress={handleDone}
                className="w-full py-4 mb-4 rounded-2xl bg-[#007AFF] active:bg-[#0051D5]"
              >
                <Text className="text-lg font-semibold text-center !text-white">
                  Get on the Court
                </Text>
              </Pressable>

              {/* Text Button */}
              <Pressable onPress={handleProgramAnother} className="py-2">
                <Text className="text-base !text-[#007AFF]">
                  Program Another Tag
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
);

TapToPlayScreen.displayName = 'TapToPlayScreen';
