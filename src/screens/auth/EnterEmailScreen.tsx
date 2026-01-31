import { useState } from 'react';
import { View, Pressable, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Heading, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { ChevronLeft } from 'lucide-react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import type { AuthStackScreenProps } from '@/types/navigation';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/common/StepIndicator';
import { auth, firestore } from '@/config/firebase';

type EnterEmailScreenProps = AuthStackScreenProps<'EnterEmail'>;

export const EnterEmailScreen = ({ navigation }: EnterEmailScreenProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailAvailability = async (email: string): Promise<{ available: boolean; error?: string }> => {
    try {
      // Check 1: Firebase Auth (for username-based accounts)
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        return { available: false, error: 'Email is already in use' };
      }

      // Check 2: Firestore (for OAuth accounts that might have this email)
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return { available: false, error: 'Email is already in use' };
      }

      return { available: true };
    } catch (error) {
      console.error('Error checking email availability:', error);
      return { available: false, error: 'Failed to verify email' };
    }
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const handleNext = async () => {
    // Reset error
    setError('');

    // Validate email format
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check availability
    setLoading(true);
    try {
      const { available, error: availabilityError } = await checkEmailAvailability(email.trim().toLowerCase());
      
      if (!available) {
        setError('This email is already registered. Try signing in instead.');
        setLoading(false);
        return;
      }

      // Navigate to password creation
      const cleanEmail = email.trim().toLowerCase();
      navigation.navigate('CreatePassword', {
        email: cleanEmail,
      });
    } catch (err) {
      console.error('Error validating email:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="justify-between flex-1 px-6">
          <View>
            {/* Top Row - Back Button and Step Indicator */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="p-2 -ml-2"
              >
                <ChevronLeft size={28} color="#000" />
              </TouchableOpacity>
              
              <StepIndicator currentStep={1} totalSteps={5} />
              
              <View className="w-10" />
            </View>

          {/* Header */}
          <VStack space="sm">
            <Heading size="2xl" className="!text-gray-900">
              Create your account
            </Heading>
            <Text size="md" className="!text-gray-600">
              Enter your email to get started. We'll use it to keep your account secure and for password recovery.
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="3xl" className="mt-8">
            <VStack space="xs">
              <Input
                variant="outline"
                size="xl"
                className={`${error ? '!border-red-500 border-2' : ''}`}
              >
                <InputField
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  editable={!loading}
                />
              </Input>
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
              disabled={loading || !email.trim()}
              loading={loading}
              fullWidth
            />
          </VStack>
          </View>

          {/* Footer - Sign In Link */}
          <View className="pb-4">
            <Pressable
              onPress={handleSignIn}
              disabled={loading}
              className="items-center py-4"
            >
              <Text className="text-base font-medium !text-gray-900">
                Already have an account?{' '}
                <Text className="font-bold !text-blue-600">Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
