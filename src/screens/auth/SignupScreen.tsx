import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
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

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async (): Promise<void> => {
    // Validation
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      await signUp(email.trim(), password, displayName);
      // Navigation handled by auth state change
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box className="flex-1 justify-center px-6 py-8">
          <VStack space="xl">
            {/* Header */}
            <VStack space="sm">
              <Heading size="3xl" className="text-gray-900">
                Create Account
              </Heading>
              <Text size="lg" className="text-gray-600">
                Join PickleBean today
              </Text>
            </VStack>

            {/* Form */}
            <VStack space="md">
              <Input variant="outline" size="lg">
                <InputField
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </Input>

              <Input variant="outline" size="lg">
                <InputField
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </Input>

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
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </Input>

              <Input variant="outline" size="lg">
                <InputField
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </Input>

              <Button
                size="lg"
                onPress={handleSignup}
                isDisabled={loading}
                className="bg-green-600"
              >
                <ButtonText>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </ButtonText>
              </Button>
            </VStack>

            {/* Login link */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-center text-gray-600">
                Already have an account?{' '}
                <Text className="text-blue-600 font-semibold">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
