import { memo, useState } from 'react';
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
    const { isWriting, writeProfileUrl } = useNFCWriter();
    const [screenState, setScreenState] = useState<ScreenState>('intro');

    const handleBack = () => {
      if (!isWriting) {
        navigation.goBack();
      }
    };

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
        // Reset on failure so user can try again
        setScreenState('intro');
      }
    };

    const handleDone = () => {
      navigation.goBack();
    };

    const handleProgramAnother = () => {
      setScreenState('intro');
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
            Tap to Play
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="p-6"
        >
          {screenState === 'intro' && (
            <>
              {/* Hero Section */}
              <Text className="mb-2 text-3xl font-bold !text-gray-900">
                Stop Asking. Start Playing.
              </Text>
              <Text className="mb-8 text-lg !text-gray-700">
                Make your paddle tap-enabled. Walk up to any game. Tap in.
                Your stats do the talking.
              </Text>

              {/* Why This Matters Section */}
              <Text className="mb-4 text-xl font-bold !text-gray-900">
                Why This Matters
              </Text>

              {/* Benefit 1 */}
              <View className="mb-6">
                <Text className="mb-1 text-lg font-semibold !text-gray-900">
                  No More Skill Checks
                </Text>
                <Text className="!text-gray-700">
                  "What's your rating?" answered before you say a word. Your
                  record is visible instantly.
                </Text>
              </View>

              {/* Benefit 2 */}
              <View className="mb-6">
                <Text className="mb-1 text-lg font-semibold !text-gray-900">
                  Phone Stays in Your Bag
                </Text>
                <Text className="!text-gray-700">
                  Play 5 games back-to-back without touching your phone. Paddle
                  tap = you're in.
                </Text>
              </View>

              {/* Benefit 3 */}
              <View className="mb-8">
                <Text className="mb-1 text-lg font-semibold !text-gray-900">
                  Walk Up to Any Court
                </Text>
                <Text className="!text-gray-700">
                  New city? No problem. Your reputation travels with you. Tap
                  and play anywhere.
                </Text>
              </View>

              {/* How It Works Section */}
              <Text className="mb-4 text-xl font-bold !text-gray-900">
                How It Works
              </Text>
              <Text className="mb-6 !text-gray-700">
                Get a blank NFC tag (sticker or keychain). Program it once. Use
                it forever.
              </Text>

              {/* Platform-specific note */}
              <View className="p-4 mb-8 rounded-lg bg-blue-50">
                <View className="flex-row items-start">
                  <Smartphone
                    size={20}
                    color="#3B82F6"
                    className="mt-0.5 mr-3"
                  />
                  <View className="flex-1">
                    <Text className="mb-1 text-sm font-semibold !text-blue-900">
                      {Platform.OS === 'ios'
                        ? 'iPhone: NFC at top edge'
                        : 'Android: NFC at center back'}
                    </Text>
                    <Text className="text-sm !text-blue-800">
                      Hold your phone near the NFC tag for 2-3 seconds
                    </Text>
                  </View>
                </View>
              </View>

              {/* CTA Button */}
              <Pressable
                onPress={handleStartWriting}
                className="items-center justify-center px-6 py-4 bg-blue-600 rounded-xl active:bg-blue-700"
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
            /* Writing State */
            <View className="items-center py-12">
              <View className="mb-6">
                <LoadingSpinner size="large" />
              </View>

              <Text className="mb-3 text-2xl font-bold text-center !text-gray-900">
                Hold Phone to NFC Tag
              </Text>

              <Text className="mb-8 text-center !text-gray-600">
                Keep your phone steady for 2-3 seconds...
              </Text>

              {/* Quick Reference */}
              <View className="w-full p-4 rounded-lg bg-amber-50">
                <View className="flex-row items-start">
                  <Smartphone
                    size={20}
                    color="#F59E0B"
                    className="mt-0.5 mr-3"
                  />
                  <Text className="flex-1 text-sm !text-amber-900">
                    {Platform.OS === 'ios'
                      ? 'Hold top of phone to tag'
                      : 'Hold back center of phone to tag'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {screenState === 'success' && (
            /* Success State */
            <View className="items-center py-8">
              <View className="items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
                <CheckCircle size={48} color="#10B981" />
              </View>

              <Text className="mb-3 text-3xl font-bold text-center !text-gray-900">
                You're Tap-Enabled!
              </Text>

              <Text className="mb-8 text-center !text-gray-700">
                Your paddle is ready. Walk up to any game. Tap in. Start
                playing.
              </Text>

              {/* How Others Use It */}
              <View className="w-full p-4 mb-8 rounded-lg bg-blue-50">
                <Text className="mb-3 font-semibold !text-blue-900">
                  How Others Use It:
                </Text>
                <View className="space-y-2">
                  <Text className="text-sm !text-blue-800">
                    • They tap your paddle with their phone
                  </Text>
                  <Text className="text-sm !text-blue-800">
                    • Your profile opens instantly
                  </Text>
                  <Text className="text-sm !text-blue-800">
                    • They add you to their game
                  </Text>
                  <Text className="text-sm !text-blue-800">
                    • Match gets tracked automatically
                  </Text>
                </View>
              </View>

              {/* Primary CTA */}
              <Pressable
                onPress={handleDone}
                className="w-full px-6 py-4 mb-4 bg-blue-600 rounded-xl active:bg-blue-700"
              >
                <Text className="text-lg font-semibold text-center !text-white">
                  Get on the Court
                </Text>
              </Pressable>

              {/* Secondary Option */}
              <Pressable onPress={handleProgramAnother}>
                <Text className="text-blue-600">Program Another Tag</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
);

TapToPlayScreen.displayName = 'TapToPlayScreen';
