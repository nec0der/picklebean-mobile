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
import { getAuthErrorMessage, isValidEmail } from '@/lib/authErrors';

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
    // Field-specific validation with clear messages
    if (!firstName.trim()) {
      Alert.alert('First Name Required', 'Please enter your first name');
      return;
    }

    if (!lastName.trim()) {
      Alert.alert('Last Name Required', 'Please enter your last name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }

    // Email format validation
    if (!isValidEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g., name@example.com)');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter a password');
      return;
    }

    // Password length validation
    if (password.length < 6) {
      Alert.alert(
        'Password Too Short',
        'Password must be at least 6 characters long for security'
      );
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Confirm Password', 'Please confirm your password');
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      Alert.alert(
        'Passwords Don\'t Match',
        'Please make sure both passwords are identical'
      );
      return;
    }

    try {
      setLoading(true);
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      await signUp(email.trim(), password, displayName);
      // Navigation handled by auth state change
    } catch (error: any) {
      // Use the error mapper for user-friendly messages
      const errorMessage = getAuthErrorMessage(error);
      Alert.alert('Sign Up Failed', errorMessage);
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
