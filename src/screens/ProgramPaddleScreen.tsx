import { memo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Smartphone, Zap, Sparkles, CheckCircle2 } from 'lucide-react-native';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNFCWriter } from '@/hooks/common/useNFCWriter';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const ProgramPaddleScreen = memo(
  ({ navigation }: RootStackScreenProps<'ProgramPaddle'>) => {
    const { userDocument } = useAuth();
    const { isWriting, writeProfileUrl } = useNFCWriter();
    const [hasStarted, setHasStarted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleBack = () => {
      if (!isWriting && !showSuccess) {
        navigation.goBack();
      }
    };

    const handleStartWriting = async () => {
      if (!userDocument?.username) return;

      setHasStarted(true);
      const profileUrl = `https://picklebean-ranking-app.web.app/profile/${userDocument.username}`;
      const success = await writeProfileUrl(profileUrl);

      if (success) {
        // Show success state
        setShowSuccess(true);
        // Navigate back after celebration
        setTimeout(() => {
          navigation.goBack();
        }, 2500);
      } else {
        // Reset on failure so user can try again
        setHasStarted(false);
      }
    };

    const handleTryAgain = () => {
      setHasStarted(false);
      setShowSuccess(false);
    };

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Header with back button */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <Pressable
            onPress={handleBack}
            className="mr-3"
            disabled={isWriting || showSuccess}
          >
            <ArrowLeft size={24} color={isWriting || showSuccess ? '#9CA3AF' : '#000'} />
          </Pressable>
          <Text className="text-lg font-semibold !text-gray-900">
            {showSuccess ? 'Success!' : 'Power Up Paddle'}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="p-6"
        >
          {showSuccess ? (
            /* Success State */
            <View className="items-center justify-center flex-1 py-12">
              {/* Success Icon with glow effect */}
              <View className="items-center justify-center w-24 h-24 mb-6 bg-green-100 rounded-full">
                <CheckCircle2 size={48} color="#10B981" />
              </View>

              <Text className="mb-3 text-3xl font-bold text-center !text-gray-900">
                Your Paddle is Magic! ✨
              </Text>

              <Text className="mb-8 text-lg text-center !text-gray-600">
                Players can now tap your paddle to see your profile and challenge you instantly
              </Text>

              {/* Benefits */}
              <View className="w-full p-6 mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50">
                <Text className="mb-4 text-lg font-semibold !text-gray-900">
                  What's Next?
                </Text>
                <View className="space-y-3">
                  <View className="flex-row items-start">
                    <Text className="mr-3 text-2xl">⚡</Text>
                    <Text className="flex-1 !text-gray-700">
                      Bring your paddle to the court
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Text className="mr-3 text-2xl">👋</Text>
                    <Text className="flex-1 !text-gray-700">
                      Let others tap it with their phones
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Text className="mr-3 text-2xl">🎯</Text>
                    <Text className="flex-1 !text-gray-700">
                      Watch them view your profile instantly!
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : !hasStarted ? (
            <>
              {/* Hero Section */}
              <View className="items-center mb-8">
                <View className="items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <Sparkles size={40} color="#FFFFFF" />
                </View>
                <Text className="mb-3 text-3xl font-bold text-center !text-gray-900">
                  Give Your Paddle{'\n'}Superpowers ⚡
                </Text>
                <Text className="text-lg text-center !text-gray-600">
                  Let players tap your paddle to challenge you instantly at the court
                </Text>
              </View>

              {/* Benefits - Visual Cards */}
              <View className="mb-8 space-y-3">
                <View className="flex-row items-center p-4 rounded-xl bg-blue-50">
                  <View className="items-center justify-center w-12 h-12 mr-4 bg-blue-100 rounded-full">
                    <Text className="text-2xl">👥</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold !text-gray-900">Instant Profile Sharing</Text>
                    <Text className="text-sm !text-gray-600">They tap, they see you</Text>
                  </View>
                </View>

                <View className="flex-row items-center p-4 rounded-xl bg-purple-50">
                  <View className="items-center justify-center w-12 h-12 mr-4 bg-purple-100 rounded-full">
                    <Text className="text-2xl">⚡</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold !text-gray-900">Quick Game Invites</Text>
                    <Text className="text-sm !text-gray-600">No typing, no searching</Text>
                  </View>
                </View>

                <View className="flex-row items-center p-4 rounded-xl bg-green-50">
                  <View className="items-center justify-center w-12 h-12 mr-4 bg-green-100 rounded-full">
                    <Text className="text-2xl">🏆</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold !text-gray-900">Show Off Rankings</Text>
                    <Text className="text-sm !text-gray-600">Your stats, IRL</Text>
                  </View>
                </View>
              </View>

              {/* Simple Visual Guide */}
              <View className="p-6 mb-8 border-2 border-blue-200 rounded-2xl bg-blue-50">
                <Text className="mb-4 text-xl font-bold text-center !text-gray-900">
                  How It Works
                </Text>
                
                {/* Visual phone positioning */}
                <View className="items-center mb-6">
                  <View className="relative">
                    {/* Phone illustration */}
                    <View className="w-32 h-56 border-4 border-gray-800 rounded-3xl bg-gradient-to-b from-gray-100 to-gray-200">
                      <View className="w-16 h-1 mx-auto mt-3 bg-gray-800 rounded-full" />
                      {/* NFC indicator at top */}
                      <View className="absolute -translate-x-1/2 top-4 left-1/2">
                        <View className="items-center justify-center w-12 h-12 bg-blue-500 rounded-full opacity-30">
                          <View className="w-8 h-8 bg-blue-400 rounded-full opacity-50" />
                        </View>
                        <View className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                          <Zap size={20} color="#FFFFFF" />
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center mt-4">
                    <View className="w-16 h-1 bg-blue-400" />
                    <Smartphone size={24} color="#3B82F6" className="mx-2" />
                    <View className="w-16 h-1 bg-blue-400" />
                  </View>
                </View>

                <Text className="mb-2 text-lg font-semibold text-center !text-gray-900">
                  Hold {Platform.OS === 'ios' ? 'top of phone' : 'back of phone'} to paddle
                </Text>
                <Text className="text-center !text-gray-600">
                  Keep steady for 2 seconds. That's it!
                </Text>
              </View>

              {/* CTA Button - More engaging */}
              <Pressable
                onPress={handleStartWriting}
                className="items-center justify-center px-6 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 active:opacity-80"
              >
                <View className="flex-row items-center">
                  <Sparkles size={24} color="#FFFFFF" className="mr-3" />
                  <Text className="text-xl font-bold !text-white">
                    Make It Magic
                  </Text>
                </View>
              </Pressable>

              {/* Reassurance */}
              <Text className="mt-4 text-sm text-center !text-gray-500">
                Works with any NFC-enabled paddle tag
              </Text>
            </>
          ) : (
            /* Writing State - Enhanced */
            <View className="items-center justify-center flex-1 py-12">
              {/* Animated loading */}
              <View className="mb-8">
                <LoadingSpinner size="large" />
              </View>

              <Text className="mb-3 text-2xl font-bold text-center !text-gray-900">
                Hold Phone to Paddle
              </Text>

              <Text className="mb-8 text-center !text-gray-600">
                Keep steady... detecting your paddle's magic spot ✨
              </Text>

              {/* Visual Guide During Scan */}
              <View className="items-center mb-8">
                <View className="relative">
                  <View className="w-32 h-56 border-4 border-gray-800 rounded-3xl bg-gradient-to-b from-gray-100 to-gray-200">
                    <View className="w-16 h-1 mx-auto mt-3 bg-gray-800 rounded-full" />
                    {/* Pulsing NFC indicator */}
                    <View className="absolute -translate-x-1/2 top-4 left-1/2">
                      <View className="items-center justify-center w-12 h-12 bg-blue-500 rounded-full animate-pulse">
                        <Zap size={20} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Helpful tip */}
              <View className="w-full p-4 rounded-xl bg-amber-50">
                <View className="flex-row items-start">
                  <Zap size={24} color="#F59E0B" className="mt-0.5 mr-3" />
                  <View className="flex-1">
                    <Text className="font-semibold !text-amber-900">
                      Pro Tip
                    </Text>
                    <Text className="!text-amber-800">
                      Hold your phone at the paddle's handle where the NFC tag is located
                    </Text>
                  </View>
                </View>
              </View>

              {/* Cancel option */}
              <Pressable
                onPress={handleTryAgain}
                className="px-6 py-3 mt-6"
              >
                <Text className="text-center !text-gray-600">
                  Cancel
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
);

ProgramPaddleScreen.displayName = 'ProgramPaddleScreen';
