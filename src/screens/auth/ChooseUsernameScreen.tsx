import { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Heading, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { X, Check } from 'lucide-react-native';
import type { AuthStackScreenProps } from '@/types/navigation';
import { validateUsername, checkUsernameAvailability } from '@/lib/username';
import { Button } from '@/components/ui/Button';

type ChooseUsernameScreenProps = AuthStackScreenProps<'ChooseUsername'>;

export const ChooseUsernameScreen = ({ navigation }: ChooseUsernameScreenProps) => {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // Debounced username availability check
  useEffect(() => {
    // Reset states
    setIsAvailable(null);
    setError('');
    
    // Don't check empty username
    if (!username.trim()) {
      setChecking(false);
      return;
    }
    
    // Show checking indicator immediately
    setChecking(true);
    
    // Debounce both format validation AND Firebase check (wait 500ms after user stops typing)
    const timeoutId = setTimeout(async () => {
      // Format validation first
      const validation = validateUsername(username);
      if (!validation.valid) {
        setError(validation.error || 'Invalid username');
        setChecking(false);
        return;
      }
      
      // Then Firebase availability check
      const result = await checkUsernameAvailability(username);
      setChecking(false);
      
      if (result.available) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
        setError(result.error || 'Username unavailable');
      }
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
      setChecking(false);
    };
  }, [username]);

  const handleNext = useCallback(() => {
    // Can only proceed if username is available
    if (!isAvailable || error || checking) {
      if (!username.trim()) {
        setError('Please enter a username');
      }
      return;
    }
    
    // Navigate to password screen
    navigation.navigate('CreatePassword', { username });
  }, [username, isAvailable, error, checking, navigation]);

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
                Choose a unique username to get started. Make it unique and memorable!
              </Text>
            </VStack>

            {/* Form */}
            <VStack space="3xl" className="mt-8">
              <VStack space="xs">
                <View className="relative">
                  <Input 
                    variant="outline" 
                    size="xl"
                    isInvalid={!!error && !checking}
                    className={`rounded-xl ${error && !checking ? '!border-red-500 border-2' : ''} ${isAvailable && !error ? '!border-green-500 border-2' : ''}`}
                  >
                    <InputField
                      placeholder="username"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                    />
                  </Input>
                  
                  {/* Right side indicator */}
                  <View className="absolute top-0 bottom-0 justify-center right-4">
                    {checking && <ActivityIndicator size="small" color="#6B7280" />}
                    {!checking && isAvailable && !error && <Check size={20} color="#10b981" />}
                    {!checking && error && <X size={20} color="#ef4444" />}
                  </View>
                </View>
                
                {/* Error message */}
                {!checking && error && (
                  <Text size="sm" className="!text-red-600">
                    {error}
                  </Text>
                )}
                
                {/* Success message */}
                {!checking && isAvailable && !error && (
                  <Text size="sm" className="!text-green-600">
                    Username is available!
                  </Text>
                )}
              </VStack>

              <Button 
                title="Next"
                size="md" 
                onPress={handleNext}
                disabled={!isAvailable || !!error || checking}
                fullWidth
              />
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
