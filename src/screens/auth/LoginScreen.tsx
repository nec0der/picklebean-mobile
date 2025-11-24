import { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Box,
  Heading,
  Button,
  ButtonText,
  Input,
  InputField,
  VStack,
  Text,
} from '@gluestack-ui/themed';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage, isValidEmail } from '@/lib/authErrors';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (): Promise<void> => {
    // Field-specific validation
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    // Email format validation
    if (!isValidEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      // Navigation handled by auth state change
    } catch (error: any) {
      // Use the error mapper for user-friendly messages
      const errorMessage = getAuthErrorMessage(error);
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <Box className="justify-center flex-1 px-6">
        <VStack space="xl">
          {/* Header */}
          <VStack space="sm">
            <Heading size="3xl" className="text-gray-900">
              Welcome Back
            </Heading>
            <Text size="lg" className="text-gray-600">
              Sign in to continue
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="md">
            <Input variant="outline" size="lg">
              <InputField
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>

            <Input variant="outline" size="lg">
              <InputField
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </Input>

            <Button
              size="lg"
              onPress={handleLogin}
              isDisabled={loading}
              className="bg-green-600"
            >
              <ButtonText>{loading ? 'Signing in...' : 'Sign In'}</ButtonText>
            </Button>
          </VStack>

          {/* Sign up link */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-center text-gray-600">
              Don't have an account?{' '}
              <Text className="font-semibold text-blue-600">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </VStack>
      </Box>
    </KeyboardAvoidingView>
  );
};
