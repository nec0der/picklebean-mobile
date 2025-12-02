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
import type { AuthStackScreenProps } from '@/types/navigation';
import { validateUsername, checkUsernameAvailability } from '@/lib/username';

type CreateAccountScreenProps = AuthStackScreenProps<'CreateAccount'>;

export const CreateAccountScreen = ({ navigation }: CreateAccountScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (text: string) => {
    // Auto-add @ if user starts typing without it
    if (text.length === 1 && !text.startsWith('@')) {
      setUsername('@' + text);
    } else {
      setUsername(text);
    }
  };

  const handleContinue = async (): Promise<void> => {
    // Validate username
    if (!username.trim()) {
      Alert.alert('Username Required', 'Please enter a username');
      return;
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      Alert.alert('Invalid Username', validation.error || 'Please check your username');
      return;
    }

    // Password validation
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter a password');
      return;
    }

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

    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", 'Please make sure both passwords are identical');
      return;
    }

    // Check username availability
    try {
      setLoading(true);
      const isAvailable = await checkUsernameAvailability(username);

      if (!isAvailable) {
        Alert.alert('Username Taken', 'This username is already taken. Please try another one.');
        return;
      }

      // Navigate to gender selection with username and password
      navigation.navigate('SelectGender', {
        username,
        password,
      });
    } catch (error) {
      console.error('Error checking username:', error);
      Alert.alert('Error', 'Failed to verify username. Please try again.');
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
        <Box className="justify-center flex-1 px-6 py-8">
          <VStack space="xl">
            {/* Header */}
            <VStack space="sm">
              <Heading size="3xl" className="!text-gray-900">
                Create Account
              </Heading>
              <Text size="lg" className="!text-gray-600">
                Choose your unique username
              </Text>
            </VStack>

            {/* Form */}
            <VStack space="md">
              <VStack space="xs">
                <Input variant="outline" size="lg">
                  <InputField
                    placeholder="@username"
                    value={username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
                <Text size="sm" className="!text-gray-500">
                  3-20 characters, letters, numbers, and underscores only
                </Text>
              </VStack>

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
                onPress={handleContinue}
                isDisabled={loading}
                className="bg-green-600"
              >
                <ButtonText>{loading ? 'Checking...' : 'Continue'}</ButtonText>
              </Button>
            </VStack>

            {/* Login link */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-center !text-gray-600">
                Already have an account?{' '}
                <Text className="font-semibold !text-blue-600">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
