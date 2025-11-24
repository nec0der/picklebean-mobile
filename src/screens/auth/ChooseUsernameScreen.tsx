import { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Box, Heading, Button, ButtonText, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { X, Check, AlertCircle } from 'lucide-react-native';
import type { AuthStackScreenProps } from '@/types/navigation';
import { validateUsername, checkUsernameAvailability } from '@/lib/username';

type ChooseUsernameScreenProps = AuthStackScreenProps<'ChooseUsername'>;

export const ChooseUsernameScreen = ({ navigation }: ChooseUsernameScreenProps) => {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // Debounced username availability check
  useEffect(() => {
    if (!username.trim()) {
      setIsAvailable(null);
      setError('');
      return;
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      setIsAvailable(false);
      setError('');
      return;
    }

    setError('');
    setChecking(true);
    
    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailability(username);
        setIsAvailable(available);
      } catch (err) {
        console.error('Error checking username:', err);
        setIsAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      setChecking(false);
    };
  }, [username]);

  const handleNext = useCallback(() => {
    // Validate username
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      setError(validation.error || 'Invalid username');
      return;
    }

    if (isAvailable === false) {
      setError('This username is already taken');
      return;
    }

    if (isAvailable === null || checking) {
      setError('Checking username availability...');
      return;
    }

    // Navigate to password screen
    navigation.navigate('CreatePassword', { username });
  }, [username, isAvailable, checking, navigation]);

  // Render input indicator
  const renderInputIndicator = () => {
    if (!username.trim()) return null;
    
    if (checking) {
      return <ActivityIndicator size="small" color="#3B82F6" />;
    }
    
    if (isAvailable === true) {
      return <Check size={20} color="#10B981" />;
    }
    
    if (isAvailable === false) {
      return <AlertCircle size={20} color="#EF4444" />;
    }
    
    return null;
  };

  return (
    <Box className="flex-1 bg-white">
      {/* Close button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        className="absolute z-10 p-4 top-12 left-4"
      >
        <X size={28} color="#000" />
      </TouchableOpacity>

      <Box className="justify-center flex-1 px-6">
        <VStack space="xl">
          {/* Header */}
          <VStack space="sm">
            <Heading size="3xl" className="text-gray-900">
              Create a username
            </Heading>
            <Text size="lg" className="text-gray-600">
              Choose a unique username to get started
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="md">
            <VStack space="xs">
              <View className="relative">
                <Input variant="outline" size="lg" className="pr-12">
                  <InputField
                    placeholder="username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </Input>
                {/* Inline indicator */}
                <View className="absolute top-0 bottom-0 justify-center right-4">
                  {renderInputIndicator()}
                </View>
              </View>
              {error ? (
                <Text size="sm" className="text-red-600">
                  {error}
                </Text>
              ) : null}
            </VStack>

            <Button size="lg" onPress={handleNext} className="bg-blue-600">
              <ButtonText>Next</ButtonText>
            </Button>
          </VStack>

          {/* Login link */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-center text-gray-600">
              Already have an account?{' '}
              <Text className="font-semibold text-blue-600">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </VStack>
      </Box>
    </Box>
  );
};
