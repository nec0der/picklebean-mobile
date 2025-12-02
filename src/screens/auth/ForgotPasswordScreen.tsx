import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { 
  Box, 
  Heading, 
  VStack, 
  Text,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import { ChevronLeft, Check } from 'lucide-react-native';
import { AuthStackParamList } from '@/types/navigation';
import { Button } from '@/components/ui/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      return;
    }

    setLoading(true);
    // TODO: Implement password reset logic
    // For now, just show success message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Box className="items-center justify-center flex-1 px-6">
          <View className="items-center mb-8">
            <View className="items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-full">
              <Check size={32} color="#166534" />
            </View>
            <Heading size="xl" className="text-center mb-3 !text-gray-900">
              Check your email
            </Heading>
            <Text size="md" className="text-center !text-gray-600">
              If an account exists for <Text className="font-bold !text-gray-900">{username}</Text>, you will receive password reset instructions.
            </Text>
          </View>

          <View className="w-full max-w-sm">
            <Button
              title="Back to Sign In"
              size="md"
              onPress={() => navigation.navigate('UsernamePasswordSignIn')}
              fullWidth
            />
          </View>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Box className="justify-between flex-1 px-6">
          <View>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="self-start p-2 -ml-2"
            >
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>

            {/* Header */}
            <VStack space="sm" className="mt-6">
              <Heading size="2xl" className="!text-gray-900">
                Reset Password
              </Heading>
              <Text size="md" className="!text-gray-600">
                Enter your username and we'll send you instructions to reset your password.
              </Text>
            </VStack>

            {/* Form */}
            <VStack space="3xl" className="mt-8">
              <VStack space="md">
                <View>
                  <Input 
                    variant="outline" 
                    size="xl" 
                    className="rounded-xl"
                  >
                    <InputField
                      value={username}
                      onChangeText={(text) => setUsername(text.toLowerCase())}
                      placeholder="Username"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                      editable={!loading}
                    />
                  </Input>
                </View>
              </VStack>

              <Button
                title="Send Instructions"
                size="md"
                onPress={handleSubmit}
                disabled={loading || !username.trim()}
                loading={loading}
                fullWidth
              />
            </VStack>
          </View>

          {/* Footer - Back to Sign In */}
          <View className="pb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={loading}
              className="items-center py-4"
            >
              <Text size="sm" className="font-medium !text-blue-600">
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
