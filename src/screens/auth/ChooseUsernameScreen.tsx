import { useState, useCallback } from 'react';
import { View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Heading, Button, ButtonText, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { X } from 'lucide-react-native';
import type { AuthStackScreenProps } from '@/types/navigation';
import { validateUsername } from '@/lib/username';

type ChooseUsernameScreenProps = AuthStackScreenProps<'ChooseUsername'>;

export const ChooseUsernameScreen = ({ navigation }: ChooseUsernameScreenProps) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleNext = useCallback(() => {
    // Clear previous error
    setError('');
    
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

    // Navigate to password screen
    navigation.navigate('CreatePassword', { username });
  }, [username, navigation]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="justify-between flex-1">
          {/* Main Content */}
          <View className="px-6">
            {/* Close button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="self-start p-2 -ml-2"
            >
              <X size={28} color="#000" />
            </TouchableOpacity>

            {/* Header */}
            <VStack space="xs" className="mt-6">
              <Heading size="2xl" className="text-gray-900">
                Create a username
              </Heading>
              <Text size="md" className="text-gray-600">
                Choose a unique username to get started
              </Text>
            </VStack>

            {/* Form */}
            <VStack space="md" className="mt-8">
              <VStack space="xs">
                <Input variant="outline" size="lg">
                  <InputField
                    placeholder="username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </Input>
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
          </View>

          {/* Footer */}
          <View className="px-6 pb-8">
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-center text-gray-600">
                Already have an account?{' '}
                <Text className="font-semibold text-blue-600">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
