import { memo, useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Check, AlertCircle } from 'lucide-react-native';
import { Input, InputField, VStack } from '@gluestack-ui/themed';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { validateUsername, checkUsernameAvailability } from '@/lib/username';
import { ScreenHeader } from '@/components/common';
import { useToast } from '@/hooks/common/useToast';

export const EditUsernameScreen = memo(({ navigation, route }: RootStackScreenProps<'EditUsername'>) => {
  const { currentUsername } = route.params;
  const { userDocument } = useAuth();
  const toast = useToast();
  
  const [username, setUsername] = useState(currentUsername);
  const [checking, setChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // Debounced username availability check
  useEffect(() => {
    // Reset states
    setIsAvailable(null);
    setError('');
    
    // Don't check if unchanged or empty
    if (!username.trim() || username === currentUsername) {
      setChecking(false);
      return;
    }
    
    // Show checking indicator immediately
    setChecking(true);
    
    // Debounce validation and check
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
  }, [username, currentUsername]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = useCallback(async () => {
    if (!userDocument?.uid) {
      toast.error('User not found');
      return;
    }

    // Validate before saving
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    if (username === currentUsername) {
      navigation.goBack();
      return;
    }
    
    if (checking) {
      return;
    }
    
    if (error || !isAvailable) {
      return;
    }
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      await updateUserProfile(userDocument.uid, {
        username: username.trim().toLowerCase(),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Username updated');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating username:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Failed to update username');
    } finally {
      setIsSaving(false);
    }
  }, [username, currentUsername, checking, error, isAvailable, userDocument, navigation, toast]);

  const canSave = username !== currentUsername && !checking && isAvailable && !error;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader 
        title="Change Username" 
        onLeftPress={handleBack}
        rightComponent={
          isSaving ? (
            <ActivityIndicator size="small" color="#16a34a" />
          ) : (
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className="active:opacity-70"
            >
              <Text className={`text-base font-semibold ${
                canSave ? '!text-green-600' : '!text-gray-400'
              }`}>
                Save
              </Text>
            </Pressable>
          )
        }
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-6">
          {/* Input Section */}
          <View>
            <Text className="mb-2 text-lg font-semibold">
              Choose a unique username. Make it memorable!
            </Text>
            <Text className="mb-4 text-sm !text-gray-500">
              Your username is how other players will find and identify you in the app.
            </Text>

            <VStack space="xs">
              <View className="relative">
                <Input 
                  variant="outline" 
                  size="xl"
                  isInvalid={!!error && !checking}
                  className={`rounded-xl ${
                    error && !checking ? '!border-red-500 border-2' : ''
                  } ${
                    isAvailable && !error ? '!border-green-500 border-2' : ''
                  }`}
                >
                  <InputField
                    placeholder="username"
                    value={username}
                    onChangeText={(text) => setUsername(text.toLowerCase())}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </Input>
                
                {/* Right side indicator */}
                <View className="absolute top-0 bottom-0 justify-center right-4">
                  {checking && <ActivityIndicator size="small" color="#6B7280" />}
                  {!checking && isAvailable && !error && username !== currentUsername && (
                    <Check size={20} color="#10b981" />
                  )}
                  {!checking && error && <AlertCircle size={20} color="#ef4444" />}
                </View>
              </View>
              
              {/* Error message */}
              {!checking && error && (
                <Text className="text-sm !text-red-600">
                  {error}
                </Text>
              )}
              
              {/* Success message */}
              {!checking && isAvailable && !error && username !== currentUsername && (
                <Text className="text-sm !text-green-600">
                  Username is available!
                </Text>
              )}
            </VStack>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

EditUsernameScreen.displayName = 'EditUsernameScreen';
