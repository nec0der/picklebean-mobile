import { memo, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNFCWriter } from '@/hooks/common/useNFCWriter';
import { TapAnimationHero } from '@/components/features/nfc/TapAnimationHero';

type ScreenState = 'intro' | 'writing' | 'success';

export const TapToPlayScreen = memo(
  ({ navigation }: RootStackScreenProps<'ProgramPaddle'>) => {
    const { userDocument } = useAuth();
    const { isWriting, writeProfileUrl, cancelWrite } = useNFCWriter();
    const [screenState, setScreenState] = useState<ScreenState>('intro');
    const [showDetails, setShowDetails] = useState(false);

    const handleBack = useCallback(async () => {
      if (isWriting) {
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
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } catch (error) {
          // Haptics not available
        }
        setScreenState('success');
      } else {
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

    // Determine animation state
    const animationState = screenState === 'success' ? 'success' : screenState === 'writing' ? 'tapping' : 'idle';

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Header */}
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

        {/* Content */}
        <View className="items-center justify-between flex-1 px-6 py-8">
          {screenState === 'intro' && (
            <>
              {/* Animation Hero */}
              <View className="w-full">
                <TapAnimationHero state={animationState} />
              </View>

              {/* Minimal Copy */}
              <View className="items-center w-full mb-auto">
                <Text className="mb-3 text-3xl font-bold text-center !text-gray-900">
                  Your Paddle,{'\n'}Your Profile
                </Text>
                <Text className="mb-6 text-lg text-center !text-gray-600">
                  Tap to join games instantly
                </Text>

                {/* Expandable Details */}
                <Pressable
                  onPress={() => setShowDetails(!showDetails)}
                  className="flex-row items-center px-4 py-2 mb-6 rounded-full bg-gray-50 active:bg-gray-100"
                >
                  <Text className="mr-2 text-sm font-medium !text-gray-700">
                    How does this work?
                  </Text>
                  {showDetails ? (
                    <ChevronUp size={16} color="#374151" />
                  ) : (
                    <ChevronDown size={16} color="#374151" />
                  )}
                </Pressable>

                {showDetails && (
                  <View className="w-full p-4 mb-6 rounded-2xl bg-gray-50">
                    <Text className="mb-3 text-sm font-semibold !text-gray-900">
                      Quick Setup:
                    </Text>
                    <Text className="mb-2 text-sm leading-5 !text-gray-700">
                      1. Get an NFC tag (sticker or keychain)
                    </Text>
                    <Text className="mb-2 text-sm leading-5 !text-gray-700">
                      2. Program it once with this button
                    </Text>
                    <Text className="mb-4 text-sm leading-5 !text-gray-700">
                      3. Attach to your paddle
                    </Text>
                    <Text className="text-sm leading-5 !text-gray-600">
                      Now anyone can tap your paddle to see your stats and add you to games.
                    </Text>
                  </View>
                )}
              </View>

              {/* CTA Button */}
              <Pressable
                onPress={handleStartWriting}
                className="items-center justify-center w-full py-4 rounded-2xl bg-[#007AFF] active:bg-[#0051D5]"
              >
                <Text className="text-lg font-semibold !text-white">
                  Program Paddle
                </Text>
              </Pressable>
            </>
          )}

          {screenState === 'writing' && (
            <>
              {/* Animation Hero */}
              <View className="w-full">
                <TapAnimationHero state={animationState} />
              </View>

              {/* Minimal Instructions */}
              <View className="items-center w-full mb-auto">
                <Text className="mb-3 text-3xl font-bold text-center !text-gray-900">
                  Hold Phone Near Tag
                </Text>
                <Text className="text-base text-center !text-gray-600">
                  Keep it steady for 2-3 seconds
                </Text>
              </View>

              {/* Cancel Button */}
              <Pressable
                onPress={handleCancelScan}
                className="items-center justify-center w-full py-4 bg-gray-100 rounded-2xl active:bg-gray-200"
              >
                <Text className="text-lg font-semibold !text-gray-900">
                  Cancel
                </Text>
              </Pressable>
            </>
          )}

          {screenState === 'success' && (
            <>
              {/* Animation Hero with Success State */}
              <View className="w-full">
                <TapAnimationHero state={animationState} />
              </View>

              {/* Success Message */}
              <View className="items-center w-full mb-auto">
                <Text className="mb-3 text-3xl font-bold text-center !text-gray-900">
                  You're Tap-Enabled!
                </Text>
                <Text className="mb-6 text-base text-center !text-gray-600">
                  Walk up. Tap in. Start playing.
                </Text>

                {/* Quick Guide */}
                <View className="w-full p-4 mb-6 rounded-2xl bg-gray-50">
                  <Text className="mb-3 text-sm font-semibold !text-gray-900">
                    What happens when someone taps:
                  </Text>
                  <Text className="mb-2 text-sm !text-gray-700">
                    • Your profile opens on their phone
                  </Text>
                  <Text className="mb-2 text-sm !text-gray-700">
                    • They can add you to their game
                  </Text>
                  <Text className="text-sm !text-gray-700">
                    • Match tracking is automatic
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="w-full space-y-3">
                <Pressable
                  onPress={handleDone}
                  className="items-center justify-center w-full py-4 rounded-2xl bg-[#007AFF] active:bg-[#0051D5]"
                >
                  <Text className="text-lg font-semibold !text-white">
                    Get on the Court
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleProgramAnother}
                  className="items-center justify-center w-full py-3"
                >
                  <Text className="text-base !text-[#007AFF]">
                    Program Another Tag
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }
);

TapToPlayScreen.displayName = 'TapToPlayScreen';
