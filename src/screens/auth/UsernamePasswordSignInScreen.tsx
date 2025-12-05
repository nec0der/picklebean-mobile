import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { 
  Box, 
  Heading, 
  VStack, 
  Text,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { AuthStackParamList } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { getAuthErrorMessage } from '@/lib/authErrors';

type Props = NativeStackScreenProps<AuthStackParamList, 'UsernamePasswordSignIn'>;

export const UsernamePasswordSignInScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(username, password);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Password Reset Unavailable',
      'Password reset is not currently available. Please contact our support team for assistance with your account.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Contact Support',
          onPress: () => {
            Linking.openURL('mailto:pickleball.sn@gmail.com?subject=Password Reset Request');
          },
        },
      ]
    );
  };

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
                Welcome back
              </Heading>
              <Text size="md" className="!text-gray-600">
                Enter your credentials to continue.
              </Text>
            </VStack>

            {/* Form */}
            <VStack space="3xl" className="mt-8">
              <VStack space="md">
                {/* Username Input */}
                <View>
                  <Input 
                    variant="outline" 
                    size="xl" 
                    className={`rounded-xl ${error ? '!border-red-500 border-2' : ''}`}
                  >
                    <InputField
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text.toLowerCase());
                        setError('');
                      }}
                      placeholder="Username"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                      editable={!loading}
                    />
                  </Input>
                </View>

                {/* Password Input */}
                <View>
                  <View className="relative">
                    <Input 
                      variant="outline" 
                      size="xl" 
                      className={`rounded-xl pr-12 ${error ? '!border-red-500 border-2' : ''}`}
                    >
                      <InputField
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          setError('');
                        }}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
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
                </View>

                {error ? (
                  <Text size="sm" className="!text-red-600">
                    {error}
                  </Text>
                ) : null}
              </VStack>

              {/* Sign In Button */}
              <Button
                title="Sign In"
                size="md"
                onPress={handleSignIn}
                disabled={loading}
                loading={loading}
                fullWidth
              />
            </VStack>
          </View>

          {/* Footer - Forgot Password Link */}
          <View className="pb-4">
            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={loading}
              className="items-center py-4"
            >
              <Text size="sm" className="font-medium !text-blue-600">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
