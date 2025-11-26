import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { isAppleSignInAvailable } from '@/lib/oauth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/hooks/common/useToast';
import { AntDesign } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();
  const insets = useSafeAreaInsets();
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
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 24,
      }}
    >
      {/* Header */}
      <View className="items-center mb-12">
        <Logo size="lg" />
        <Text className="mt-6 text-2xl font-bold text-gray-900">
          Welcome Back
        </Text>
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
          <Text className="text-base font-semibold text-gray-900">
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
            <Text className="text-base font-semibold text-gray-900">
              Continue with Apple
            </Text>
          </Pressable>
        )}

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
          <Text className="text-base font-semibold text-gray-900">
            Sign in with username
          </Text>
        </Pressable>
      </View>

      {/* Sign up link */}
      <View className="items-center mb-8">
        <Pressable onPress={handleSignUp} disabled={loading}>
          <Text className="text-gray-600">
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
      <View className="items-center">
        <Text className="mb-2 text-xs text-center text-gray-500">
          By continuing, you agree to our
        </Text>
        <View className="flex-row items-center gap-2">
          <Pressable onPress={handleTermsPress}>
            <Text className="text-xs font-medium text-gray-600 underline">
              Terms of Service
            </Text>
          </Pressable>
          <Text className="text-xs text-gray-400">•</Text>
          <Pressable onPress={handlePrivacyPress}>
            <Text className="text-xs font-medium text-gray-600 underline">
              Privacy Policy
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
