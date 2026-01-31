import { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Heading, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import type { AuthStackScreenProps } from '@/types/navigation';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/common/StepIndicator';

type CreatePasswordScreenProps = AuthStackScreenProps<'CreatePassword'>;

export const CreatePasswordScreen = ({ navigation, route }: CreatePasswordScreenProps) => {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    // Validate password
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Navigate to username selection
    navigation.navigate('ChooseUsername', {
      email,
      password,
      isSignupFlow: true,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-6">
          {/* Top Row - Back Button and Step Indicator */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2 -ml-2"
            >
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>
            
            <StepIndicator currentStep={2} totalSteps={5} />
            
            <View className="w-10" />
          </View>

          {/* Header */}
          <VStack space="xs">
            <Heading size="2xl" className="!text-gray-900">
              Create a password
            </Heading>
            <Text size="md" className="!text-gray-600">
              Password must be at least 6 characters. It should be something others can't guess.
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="3xl" className="mt-8">
            <VStack space="xs">
              <View className="relative">
                <Input 
                  variant="outline" 
                  size="xl" 
                  className={`pr-12 ${error ? '!border-red-500 border-2' : ''}`}
                >
                  <InputField
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoFocus
                  />
                </Input>
                {/* Eye toggle button */}
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute top-0 bottom-0 justify-center right-4"
                >
                  {showPassword ? (
                    <Eye size={20} color="#6B7280" />
                  ) : (
                    <EyeOff size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {error ? (
                <Text size="sm" className="!text-red-600">
                  {error}
                </Text>
              ) : null}
            </VStack>

            <Button 
              title="Next"
              size="md" 
              onPress={handleNext}
              fullWidth
            />
          </VStack>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
