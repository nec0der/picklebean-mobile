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

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      // Navigation handled by auth state change
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <Box className="flex-1 justify-center px-6">
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
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-center text-gray-600">
              Don't have an account?{' '}
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </VStack>
      </Box>
    </KeyboardAvoidingView>
  );
};
