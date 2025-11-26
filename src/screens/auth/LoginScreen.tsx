import { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  Box,
  Heading,
  Button,
  ButtonText,
  Input,
  InputField,
  VStack,
  Text,
  HStack,
} from '@gluestack-ui/themed';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { isUsername, usernameToEmail } from '@/lib/username';
import { Logo } from '@/components/ui/Logo';
import { isAppleSignInAvailable } from '@/lib/oauth';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();

  // Check if Apple Sign-In is available
  useEffect(() => {
    const checkAppleSignIn = async () => {
      console.log('🍎 [Apple Sign-In] Starting availability check...');
      console.log('🍎 [Apple Sign-In] Platform:', Platform.OS);
      console.log('🍎 [Apple Sign-In] Platform version:', Platform.Version);
      
      try {
        const available = await isAppleSignInAvailable();
        console.log('🍎 [Apple Sign-In] isAppleSignInAvailable result:', available);
        setShowAppleSignIn(available);
        console.log('🍎 [Apple Sign-In] State updated. Should show button:', available);
      } catch (error) {
        console.error('🍎 [Apple Sign-In] Error checking availability:', error);
        setShowAppleSignIn(false);
      }
    };
    checkAppleSignIn();
  }, []);

  const handleEmailLogin = async (): Promise<void> => {
    if (!email.trim()) {
      Alert.alert('Username Required', 'Please enter your username or email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password');
      return;
    }

    try {
      setLoading(true);
      
      // Convert username to email if needed
      let loginEmail = email.trim();
      if (isUsername(loginEmail)) {
        loginEmail = usernameToEmail(loginEmail);
      }
      
      await signIn(loginEmail, password);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message || 'Unable to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async (): Promise<void> => {
    try {
      setLoading(true);
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Apple Sign-In Failed', error.message || 'Unable to sign in with Apple');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <Box className="flex-1 px-6">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="self-start p-2 mt-2 -ml-2"
            >
              <ChevronLeft size={28} color="#000" />
            </TouchableOpacity>

            {/* Logo */}
            <View className="items-center mt-8 mb-6">
              <Logo size="lg" />
            </View>

            {/* Header */}
            <VStack space="sm" className="mb-8">
              <Heading size="2xl" className="text-center text-gray-900">
                Welcome Back
              </Heading>
              <Text size="md" className="text-center text-gray-600">
                Sign in to continue playing
              </Text>
            </VStack>

            {/* OAuth Buttons */}
            <VStack space="md" className="mb-6">
              {/* Google Sign-In */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={loading}
                className={`rounded-xl border-2 border-gray-300 p-4 ${
                  loading ? 'opacity-50' : 'bg-white'
                }`}
              >
                <HStack space="md" className="items-center justify-center">
                  <Text className="text-lg font-semibold text-gray-900">
                    Continue with Google
                  </Text>
                </HStack>
              </TouchableOpacity>

              {/* Apple Sign-In (iOS only) */}
              {showAppleSignIn && (
                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  disabled={loading}
                  className={`rounded-xl border-2 border-gray-900 bg-black p-4 ${
                    loading ? 'opacity-50' : ''
                  }`}
                >
                  <HStack space="md" className="items-center justify-center">
                    <Text className="text-lg font-semibold text-white">
                      Continue with Apple
                    </Text>
                  </HStack>
                </TouchableOpacity>
              )}
            </VStack>

            {/* Divider */}
            <HStack space="md" className="items-center mb-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="text-gray-500">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </HStack>

            {/* Email/Password Form */}
            <VStack space="md" className="mb-6">
              <Input variant="outline" size="lg">
                <InputField
                  placeholder="@username or email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </Input>

              <Input variant="outline" size="lg">
                <InputField
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </Input>

              <Button
                size="lg"
                onPress={handleEmailLogin}
                isDisabled={loading}
                className="bg-green-600"
              >
                <ButtonText>
                  {loading ? 'Signing in...' : 'Sign In'}
                </ButtonText>
              </Button>
            </VStack>

            {/* Sign up link */}
            <View className="items-center mt-4 mb-8">
              <TouchableOpacity onPress={() => navigation.navigate('ChooseUsername')}>
                <Text className="text-center text-gray-600">
                  Don't have an account?{' '}
                  <Text className="font-semibold text-blue-600">Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Box>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};
