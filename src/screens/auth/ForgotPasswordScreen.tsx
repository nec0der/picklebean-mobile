import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!username.trim()) {
      return;
    }

    setLoading(true);
    // TODO: Implement password reset logic
    // For now, just show success message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <View
        className="flex-1 bg-white"
        style={{
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
        }}
      >
        <View className="items-center justify-center flex-1">
          <View className="items-center mb-8">
            <View className="items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
              <Text className="text-3xl">✓</Text>
            </View>
            <Text className="mb-2 text-2xl font-bold text-center text-gray-900">
              Check your email
            </Text>
            <Text className="text-base text-center text-gray-600">
              If an account exists for {username}, you will receive password reset instructions.
            </Text>
          </View>

          <Button
            title="Back to Sign In"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <Logo size="lg" />
          <Text className="mt-6 text-2xl font-bold text-gray-900">
            Reset Password
          </Text>
          <Text className="mt-2 text-base text-center text-gray-600">
            Enter your username and we'll send you instructions to reset your password
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1">
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Username
            </Text>
            <Input
              value={username}
              onChangeText={(text) => setUsername(text.toLowerCase())}
              placeholder="Enter username"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <Button
            title="Send Reset Instructions"
            onPress={handleSubmit}
            disabled={loading || !username.trim()}
            loading={loading}
          />
        </View>

        {/* Back to sign in */}
        <View className="items-center mt-6">
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text className="text-gray-600">
              Remember your password?{' '}
              <Text className="font-semibold text-blue-600">
                Sign in
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
