import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Box, Heading, Button, ButtonText, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import type { AuthStackScreenProps } from '@/types/navigation';

type CreatePasswordScreenProps = AuthStackScreenProps<'CreatePassword'>;

export const CreatePasswordScreen = ({ navigation, route }: CreatePasswordScreenProps) => {
  const { username } = route.params;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAccount = () => {
    // Validate password
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Navigate to gender selection
    navigation.navigate('SelectGender', {
      username,
      password,
    });
  };

  return (
    <Box className="flex-1 bg-white">
      {/* Back button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute z-10 p-4 top-12 left-4"
      >
        <ChevronLeft size={28} color="#000" />
      </TouchableOpacity>

      <Box className="justify-center flex-1 px-6">
        <VStack space="xl">
          {/* Header */}
          <VStack space="sm">
            <Heading size="3xl" className="text-gray-900">
              Create a password
            </Heading>
            <Text size="lg" className="text-gray-600">
              Password must be at least 6 characters
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="md">
            <VStack space="xs">
              <View className="relative">
                <Input variant="outline" size="lg" className="pr-12">
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
                <Text size="sm" className="text-red-600">
                  {error}
                </Text>
              ) : null}
            </VStack>

            <Button size="lg" onPress={handleCreateAccount} className="bg-green-600">
              <ButtonText>Create Account</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};
