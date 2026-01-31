import { memo, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNFCWriter } from '@/hooks/common/useNFCWriter';
import { TapAnimationHero } from '@/components/features/nfc/TapAnimationHero';
import { OnboardingCarousel } from '@/components/features/nfc/OnboardingCarousel';
import { markTapToPlayOnboardingSeen } from '@/services/userService';

type ScreenState = 'onboarding' | 'setup' | 'writing' | 'success';

export const TapToPlayScreen = memo(
  ({ navigation }: RootStackScreenProps<'ProgramPaddle'>) => {
    const { user, userDocument } = useAuth();
    const { isWriting, writeProfileUrl, cancelWrite } = useNFCWriter();
    
    // Check if user has seen onboarding
    const hasSeenOnboarding = userDocument?.hasSeenTapToPlayOnboarding || false;
    
    const [screenState, setScreenState] = useState<ScreenState>(
      hasSeenOnboarding ? 'setup' : 'onboarding'
    );
    const [showDetails, setShowDetails] = useState(false);

    const handleBack = useCallback(async () => {
      if (isWriting) {
        await cancelWrite();
        setScreenState('setup');
      }
      navigation.goBack();
    }, [isWriting, cancelWrite, navigation]);

    const handleOnboardingComplete = async () => {
      if (user?.id) {
        try {
          await markTapToPlayOnboardingSeen(user.id);
        } catch (error) {
          console.error('Error marking onboarding as seen:', error);
        }
      }
      setScreenState('setup');
    };

    const handleSkipOnboarding = async () => {
      if (user?.id) {
        try {
          await markTapToPlayOnboardingSeen(user.id);
        } catch (error) {
          console.error('Error marking onboarding as seen:', error);
        }
      }
      setScreenState('setup');
    };

    const handleShowHelp = () => {
      setScreenState('onboarding');
    };

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
        setScreenState('setup');
      }
    };

    const handleCancelScan = useCallback(async () => {
      await cancelWrite();
      setScreenState('setup');
    }, [cancelWrite]);

    const handleDone = () => {
      navigation.goBack();
    };

    const handleProgramAnother = () => {
      setScreenState('setup');
    };

    // Show onboarding carousel
    if (screenState === 'onboarding') {
      return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <OnboardingCarousel
            onComplete={handleOnboardingComplete}
            onSkip={handleSkipOnboarding}
          />
        </SafeAreaView>
      );
    }

    // Determine animation state for writing/success only
    const animationState = screenState === 'success' ? 'success' : screenState === 'writing' ? 'tapping' : 'idle';

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Header - Match LobbyDetail style */}
        <View className="relative flex-row items-center justify-center px-4 py-3 border-b border-gray-200">
          <Pressable
            onPress={handleBack}
            className="absolute p-2 left-4"
          >
            <ChevronLeft size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-xl font-bold !text-gray-900">
            {screenState === 'setup' ? 'Setup Tap-to-Play' : 'Tap-to-Play'}
          </Text>
          {screenState === 'setup' && (
            <Pressable
              onPress={handleShowHelp}
              className="absolute p-2 right-4"
            >
              <HelpCircle size={24} color="#007AFF" />
            </Pressable>
          )}
        </View>

        {/* Content */}
        <View className="items-center justify-between flex-1 px-6 py-8">
          {screenState === 'setup' && (
            <>
              {/* Setup Instructions - NO ANIMATION */}
              <View className="items-center w-full mb-auto">
                <Text className="mb-3 text-2xl font-bold text-center !text-gray-900">
                  Ready to Program?
                </Text>
                <Text className="mb-6 text-base text-center !text-gray-600">
                  Get your paddle tap-enabled
                </Text>

                {/* What You Need */}
                <View className="w-full p-4 mb-6 rounded-2xl bg-gray-50">
                  <Text className="mb-3 text-sm font-semibold !text-gray-900">
                    What You Need:
                  </Text>
                  <Text className="mb-2 text-sm !text-gray-700">
                    • NFC sticker (circular recommended)
                  </Text>
                  <Text className="text-sm !text-gray-700">
                    • Stick to your paddle (anywhere)
                  </Text>
                </View>

                {/* Expandable Details */}
                <Pressable
                  onPress={() => setShowDetails(!showDetails)}
                  className="flex-row items-center px-4 py-2 mb-6 rounded-full bg-gray-50 active:bg-gray-100"
                >
                  <Text className="mr-2 text-sm font-medium !text-gray-700">
                    Where to get NFC tags?
                  </Text>
                  {showDetails ? (
                    <ChevronUp size={16} color="#374151" />
                  ) : (
                    <ChevronDown size={16} color="#374151" />
                  )}
                </Pressable>

                {showDetails && (
                  <View className="w-full p-4 mb-6 rounded-2xl bg-gray-50">
                    <Text className="text-sm leading-5 !text-gray-700">
                      Search for "NFC sticker" or "NFC tag" on Amazon or any electronics store. 
                      Circular stickers work best for paddle handles. Most blank NFC tags will work!
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
                  Program Tag
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
                  Stick it to your paddle and you're ready!
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
                    Done
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
