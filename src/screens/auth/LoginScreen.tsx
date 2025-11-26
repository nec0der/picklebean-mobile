import React, { useState, useEffect } from 'react';
import { View, Pressable, Linking, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Heading, VStack, Text } from '@gluestack-ui/themed';
import { AuthStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { isAppleSignInAvailable } from '@/lib/oauth';
import { useToast } from '@/hooks/common/useToast';
import { AntDesign } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();
  const toast = useToast();

  // Check if Apple Sign-In is available
  useEffect(() => {
    const checkAppleSignIn = async () => {
      try {
        const available = await isAppleSignInAvailable();
        setShowAppleSignIn(available);
      } catch (error) {
        console.error('Error checking Apple Sign-In availability:', error);
        setShowAppleSignIn(false);
      }
    };
    checkAppleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Unable to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithApple();
    } catch (error: any) {
      toast.error(error.message || 'Unable to sign in with Apple');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSignIn = () => {
    navigation.navigate('UsernamePasswordSignIn');
  };

  const handleSignUp = () => {
    navigation.navigate('ChooseUsername');
  };

  const handleTermsPress = () => {
    // TODO: Replace with actual terms URL
    Linking.openURL('https://picklebean.com/terms');
  };

  const handlePrivacyPress = () => {
    // TODO: Replace with actual privacy URL
    Linking.openURL('https://picklebean.com/privacy');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="items-center mt-8 mb-12">
          <Logo size="lg" />
          <VStack space="sm" className="items-center mt-6">
            <Heading size="2xl" className="text-gray-900">
              Welcome Back
            </Heading>
          </VStack>
        </View>

      {/* OAuth Buttons */}
      <View className="gap-3 mb-8">
        {/* Google Sign-In */}
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={loading}
          className={`relative items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-2xl bg-white ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <View className="absolute left-6">
            <AntDesign name="google" size={20} color="#4285F4" />
          </View>
          <Text size="lg" className="font-semibold text-gray-900">
            Continue with Google
          </Text>
        </Pressable>

        {/* Apple Sign-In */}
        {showAppleSignIn && (
          <Pressable
            onPress={handleAppleSignIn}
            disabled={loading}
            className={`relative items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-2xl bg-white ${
              loading ? 'opacity-50' : ''
            }`}
          >
            <View className="absolute left-6">
              <AntDesign name="apple" size={20} color="#000000" />
            </View>
          <Text size="lg" className="font-semibold text-gray-900">
            Continue with Apple
          </Text>
          </Pressable>
        )}

        {/* OR Divider */}
        <View className="flex-row items-center my-2">
          <View className="flex-1 h-px bg-gray-300" />
          <Text size="md" className="px-4 text-gray-500">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Username/Password Sign-In */}
        <Pressable
          onPress={handleUsernameSignIn}
          disabled={loading}
          className={`relative items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-2xl bg-white ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <View className="absolute left-6">
            <AntDesign name="user" size={20} color="#374151" />
          </View>
          <Text size="lg" className="font-semibold text-gray-900">
            Sign in with username
          </Text>
        </Pressable>
      </View>

      {/* Sign up link */}
      <View className="items-center mb-8">
        <Pressable onPress={handleSignUp} disabled={loading}>
          <Text size="md" className="text-gray-600">
            Don't have an account?{' '}
            <Text className="font-semibold text-blue-600">
              Sign up
            </Text>
          </Text>
        </Pressable>
      </View>

      {/* Spacer */}
      <View className="flex-1" />

      {/* Terms and Privacy */}
      <View className="items-center pb-8">
        <Text size="sm" className="mb-2 text-center text-gray-500">
          By continuing, you agree to our
        </Text>
        <View className="flex-row items-center gap-2">
          <Pressable onPress={handleTermsPress}>
            <Text size="sm" className="font-medium text-gray-600 underline">
              Terms of Service
            </Text>
          </Pressable>
          <Text size="sm" className="text-gray-400">•</Text>
          <Pressable onPress={handlePrivacyPress}>
            <Text size="sm" className="font-medium text-gray-600 underline">
              Privacy Policy
            </Text>
          </Pressable>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
};
