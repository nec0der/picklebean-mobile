import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<AuthStackParamList, 'UsernamePasswordSignIn'>;

export const UsernamePasswordSignInScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(username, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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
            Sign In
          </Text>
          <Text className="mt-2 text-base text-center text-gray-600">
            Enter your username and password
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1">
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Username
            </Text>
            <Input
              value={username}
              onChangeText={(text) => {
                setUsername(text.toLowerCase());
                setError('');
              }}
              placeholder="Enter username"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-700">
                Password
              </Text>
              <Pressable
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={loading}
              >
                <Text className="text-sm font-medium text-blue-600">
                  Forgot?
                </Text>
              </Pressable>
            </View>
            <Input
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              placeholder="Enter password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {error ? (
            <View className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
              <Text className="text-sm text-red-800">{error}</Text>
            </View>
          ) : null}

          <Button
            title="Sign In"
            onPress={handleSignIn}
            disabled={loading || !username.trim() || !password.trim()}
            loading={loading}
          />
        </View>

        {/* Back to options */}
        <View className="items-center mt-6">
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text className="text-gray-600">
              Back to{' '}
              <Text className="font-semibold text-blue-600">
                other options
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
