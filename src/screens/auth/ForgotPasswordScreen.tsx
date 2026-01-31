import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { 
  Box, 
  Heading, 
  VStack, 
  Text,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import { ChevronLeft, Check, Info } from 'lucide-react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, firestore } from '@/config/firebase';
import { AuthStackParamList } from '@/types/navigation';
import { Button } from '@/components/ui/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

// Helper: Check if input is email format
const isEmail = (input: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

// Helper: Mask email for privacy (j***n@gmail.com)
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return email; // Don't mask very short emails
  const firstChar = local[0];
  const lastChar = local[local.length - 1];
  const masked = firstChar + '***' + lastChar;
  return `${masked}@${domain}`;
};

export const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [displayEmail, setDisplayEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthProvider, setOauthProvider] = useState<'google' | 'apple' | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Please enter your username or email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let emailToSend: string;
      let emailToDisplay: string;
      let authProvider: string | undefined;
      const cleanInput = input.trim().toLowerCase();
      
      console.log('🔍 [Password Reset] Starting reset for input:', cleanInput);
      console.log('🔍 [Password Reset] Is email format?', isEmail(cleanInput));
      
      if (isEmail(cleanInput)) {
        // Input is an email - query Firestore to get auth provider
        console.log('📧 [Password Reset] Querying by email:', cleanInput);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', cleanInput));
        const snapshot = await getDocs(q);
        
        console.log('📧 [Password Reset] Found user:', !snapshot.empty);
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0].data();
          emailToSend = userDoc.email;
          emailToDisplay = cleanInput; // Show full email
          authProvider = userDoc.authProvider;
          console.log('📧 [Password Reset] Email to send:', emailToSend);
          console.log('🔐 [Password Reset] Auth provider:', authProvider);
        } else {
          // Email not found - still show success (security best practice)
          console.log('⚠️ [Password Reset] Email not found - showing success anyway');
          setDisplayEmail(cleanInput);
          setSubmitted(true);
          setLoading(false);
          return;
        }
      } else {
        // Input is a username - query Firestore to get email and auth provider
        const cleanUsername = cleanInput.replace('@', '');
        console.log('👤 [Password Reset] Querying by username:', cleanUsername);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', cleanUsername));
        const snapshot = await getDocs(q);
        
        console.log('👤 [Password Reset] Found user:', !snapshot.empty);
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0].data();
          emailToSend = userDoc.email;
          emailToDisplay = maskEmail(userDoc.email); // Mask email for username input
          authProvider = userDoc.authProvider;
          console.log('📧 [Password Reset] Email to send:', emailToSend);
          console.log('🔐 [Password Reset] Auth provider:', authProvider);
        } else {
          // Username not found - still show success (security best practice)
          console.log('⚠️ [Password Reset] Username not found - showing success anyway');
          setDisplayEmail(input);
          setSubmitted(true);
          setLoading(false);
          return;
        }
      }
      
      // Check auth provider from Firestore (reliable!)
      if (authProvider === 'google.com') {
        console.log('🚫 [Password Reset] OAuth account (Google) - not sending email');
        setOauthProvider('google');
        setLoading(false);
        return;
      } else if (authProvider === 'apple.com') {
        console.log('🚫 [Password Reset] OAuth account (Apple) - not sending email');
        setOauthProvider('apple');
        setLoading(false);
        return;
      }
      
      // authProvider === 'password' or undefined (old accounts) - send reset email
      console.log('📨 [Password Reset] Sending reset email to:', emailToSend);
      await sendPasswordResetEmail(auth, emailToSend);
      console.log('✅ [Password Reset] Email sent successfully!');
      
      // Show success with appropriate email display
      setDisplayEmail(emailToDisplay);
      setSubmitted(true);
      setLoading(false);
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      
      // Handle specific errors
      if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        // For security, still show success message for other errors
        setDisplayEmail(input);
        setSubmitted(true);
      }
      setLoading(false);
    }
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
              Reset instructions have been sent to{' '}
              <Text className="font-semibold !text-gray-900">{displayEmail}</Text>
            </Text>
            <Text size="sm" className="text-center !text-gray-500 mt-4">
              If you don't see it, check your spam folder.
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
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
                  Reset your password
                </Heading>
                <Text size="md" className="!text-gray-600">
                  Enter your username or email and we'll send you reset instructions.
                </Text>
              </VStack>

              {/* Form */}
              <VStack space="3xl" className="mt-8">
                <VStack space="xs">
                  <View>
                    <Input 
                      variant="outline" 
                      size="xl" 
                      className={`rounded-xl ${error ? '!border-red-500 border-2' : ''}`}
                    >
                      <InputField
                        value={input}
                        onChangeText={(text) => {
                          setInput(text.toLowerCase());
                          setError('');
                          setOauthProvider(null);
                        }}
                        placeholder="Username or email"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus
                        editable={!loading}
                      />
                    </Input>
                  </View>
                  
                  {/* OAuth Info Banner */}
                  {oauthProvider ? (
                    <View className="p-4 mt-2 border border-blue-200 rounded-lg bg-blue-50">
                      <View className="flex-row items-start gap-3">
                        <Info size={20} color="#2563eb" className="mt-0.5" />
                        <View className="flex-1">
                          <Text size="sm" className="!text-blue-900 !font-semibold mb-1">
                            No password needed
                          </Text>
                          <Text size="sm" className="!text-blue-700">
                            This account uses {oauthProvider === 'google' ? 'Google' : 'Apple'} Sign-In. 
                            Use the "Continue with {oauthProvider === 'google' ? 'Google' : 'Apple'}" button on the{' '}
                            <Text
                              size="sm"
                              className="!text-blue-600 font-semibold"
                              onPress={() => navigation.navigate('Login')}
                            >
                              login screen
                            </Text>
                            {' '}instead.
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : error ? (
                    <Text size="sm" className="!text-red-600">
                      {error}
                    </Text>
                  ) : null}
                </VStack>

                <Button
                  title="Send reset link"
                  size="md"
                  onPress={handleSubmit}
                  disabled={loading || !input.trim()}
                  loading={loading}
                  fullWidth
                />
              </VStack>
            </View>

            {/* Footer - Back to Sign In */}
            <View className="pb-4">
              <Pressable
                onPress={() => navigation.goBack()}
                disabled={loading}
                className="items-center py-4"
              >
                <Text className="text-base font-bold !text-blue-600">
                  Back to Sign In
                </Text>
              </Pressable>
            </View>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
