import { memo, useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Check, AlertCircle } from 'lucide-react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  Input,
  InputField,
  VStack,
} from '@gluestack-ui/themed';
import { validateUsername, checkUsernameAvailability } from '@/lib/username';

interface UsernameEditSheetProps {
  visible: boolean;
  currentUsername: string;
  onClose: () => void;
  onSave: (newUsername: string) => void;
}

export const UsernameEditSheet = memo(({
  visible,
  currentUsername,
  onClose,
  onSave,
}: UsernameEditSheetProps) => {
  const [username, setUsername] = useState(currentUsername);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // Reset when sheet opens/closes
  useEffect(() => {
    if (visible) {
      setUsername(currentUsername);
      setError('');
      setIsAvailable(null);
      setChecking(false);
    }
  }, [visible, currentUsername]);

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

  const handleSave = useCallback(() => {
    // Validate before saving
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    if (username === currentUsername) {
      onClose();
      return;
    }
    
    if (checking) {
      return;
    }
    
    if (error || !isAvailable) {
      return;
    }
    
    onSave(username.trim().toLowerCase());
    onClose();
  }, [username, currentUsername, checking, error, isAvailable, onSave, onClose]);

  const canSave = username !== currentUsername && !checking && isAvailable && !error;

  return (
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-0 pb-8">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        
        <View className="w-full py-6">
          {/* Title */}
          <Text className="px-6 mb-6 text-xl font-bold !text-gray-900">
            Change Username
          </Text>
          
          {/* Username Input */}
          <View className="px-6 mb-6">
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
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}

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
          
          {/* Buttons */}
          <View className="flex-row gap-3 px-6">
            <Pressable 
              onPress={onClose}
              className="flex-1 py-4 bg-gray-100 rounded-lg active:bg-gray-200"
            >
              <Text className="font-medium text-center !text-gray-700">
                Cancel
              </Text>
            </Pressable>
            
            <Pressable 
              onPress={handleSave}
              disabled={!canSave}
              className={`flex-1 py-4 rounded-lg ${
                canSave 
                  ? 'bg-green-500 active:bg-green-600' 
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`font-bold text-center ${
                canSave ? '!text-white' : '!text-gray-500'
              }`}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
});

UsernameEditSheet.displayName = 'UsernameEditSheet';

export type { UsernameEditSheetProps };
