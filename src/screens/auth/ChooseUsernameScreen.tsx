import { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Heading, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react-native';
import type { AuthStackScreenProps, OnboardingStackScreenProps } from '@/types/navigation';
import { validateUsername, checkUsernameAvailability } from '@/lib/username';
import { Button } from '@/components/ui/Button';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';

type ChooseUsernameScreenProps = OnboardingStackScreenProps<'ChooseUsername'>;

export const ChooseUsernameScreen = ({ navigation }: ChooseUsernameScreenProps) => {
  const route = useRoute();
  const oauthPhotoURL = (route.params as any)?.oauthPhotoURL;
  const isOAuthFlow = !!oauthPhotoURL;
  const { signOut } = useAuth();
  
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

  const handleBack = useCallback(async () => {
    if (isOAuthFlow) {
      // Show confirmation for OAuth users
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out and return to login?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Out', 
            style: 'destructive',
            onPress: async () => {
              await signOut();
              // Navigation will happen automatically when user signs out
            }
          }
        ]
      );
    } else {
      // Non-OAuth users: just sign out (no confirmation)
      await signOut();
    }
  }, [isOAuthFlow, signOut]);

  const handleNext = useCallback(() => {
    // Check if username is empty first
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    // Check if username is being validated
    if (checking) {
      return;
    }
    
    // Check if there are validation errors
    if (error) {
      return;
    }
    
    // Check if username is available
    if (!isAvailable) {
      setError('Please wait for username validation');
      return;
    }
    
    // Navigate based on flow type
    if (isOAuthFlow) {
      // OAuth flow: go to gender selection
      (navigation as any).navigate('SelectGender', { username, oauthPhotoURL });
    } else {
      // Username/password flow: go to create password
      (navigation as any).navigate('CreatePassword', { username });
    }
  }, [username, isAvailable, error, checking, navigation, isOAuthFlow, oauthPhotoURL]);

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
              onPress={handleBack}
              className="self-start p-2 -ml-2"
            >
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>

            {/* Header */}
            <VStack space="xs" className="mt-6">
              <Heading size="2xl" className="!text-gray-900">
                Create a username
              </Heading>
              <Text size="md" className="!text-gray-600">
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
                    {!checking && error && <AlertCircle size={20} color="#ef4444" />}
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
                fullWidth
              />
            </VStack>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
