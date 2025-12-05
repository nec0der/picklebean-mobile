import React, { useState, useEffect } from "react";
import { View, Pressable, Linking, SafeAreaView, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { VStack, Text } from "@gluestack-ui/themed";
import { AuthStackParamList } from "@/types/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { isAppleSignInAvailable } from "@/lib/oauth";
import { useToast } from "@/hooks/common/useToast";
import { AntDesign } from "@expo/vector-icons";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [showAppleSignIn, setShowAppleSignIn] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();
  const toast = useToast();

  // Check if Apple Sign-In is available
  useEffect(() => {
    const checkAppleSignIn = async () => {
      try {
        const available = await isAppleSignInAvailable();
        setShowAppleSignIn(available);
      } catch (error) {
        console.error("Error checking Apple Sign-In availability:", error);
        setShowAppleSignIn(false);
      }
    };
    checkAppleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading('google');
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || "Unable to sign in with Google");
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading('apple');
      await signInWithApple();
    } catch (error: any) {
      toast.error(error.message || "Unable to sign in with Apple");
      setLoading(null);
    }
  };

  const handleUsernameSignIn = () => {
    navigation.navigate("UsernamePasswordSignIn");
  };

  const handleCreateAccount = () => {
    navigation.navigate("ChooseUsername", { isSignupFlow: true });
  };

  const handleTermsPress = () => {
    Linking.openURL("https://picklebean.com/terms");
  };

  const handlePrivacyPress = () => {
    Linking.openURL("https://picklebean.com/privacy");
  };

  const isLoading = loading !== null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="justify-between flex-1 px-6 pt-12 pb-10">
        
        {/* Header - Minimal & Clean */}
        <View className="items-center flex-1 justify-center max-h-[30%]">
          <Logo size="xl" />
          {/* Removed tagline for cleaner look, or keep it very subtle */}
          <Text size="md" className="mt-6 font-medium tracking-wide text-center !text-gray-500">
            Track matches. Rise up.
          </Text>
        </View>

        {/* Action Area */}
        <VStack space="md" className="w-full max-w-sm mx-auto">
          {/* Google */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            className={`flex-row items-center justify-center px-6 py-4 rounded-xl border border-gray-200 bg-white active:bg-gray-50 ${
              isLoading ? "opacity-50" : ""
            }`}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#4B5563" />
            ) : (
              <>
                <View style={{ marginRight: 12 }}>
                  <GoogleLogo size={20} />
                </View>
                <Text className="text-base font-semibold !text-gray-900">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Apple */}
          {showAppleSignIn && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={isLoading}
              className={`flex-row items-center justify-center px-6 py-4 rounded-xl bg-black active:bg-gray-900 ${
                isLoading ? "opacity-50" : ""
              }`}
            >
              {loading === 'apple' ? (
                <ActivityIndicator color="white" />
              ) : (
              <>
                <AntDesign name="apple" size={20} color="white" style={{ marginRight: 12 }} />
                <Text className="text-base font-semibold !text-white">
                  Continue with Apple
                </Text>
              </>
              )}
            </Pressable>
          )}

          {/* Username (Subtle) */}
          <Pressable
            onPress={handleUsernameSignIn}
            disabled={isLoading}
            className="items-center justify-center py-3 mt-2"
          >
            <Text className="text-sm font-medium !text-gray-500">
              Sign in with username
            </Text>
          </Pressable>
        </VStack>

        {/* Footer - Bare essentials */}
        <View className="items-center">
          <Pressable 
            onPress={handleCreateAccount} 
            disabled={isLoading}
            className="mb-8"
          >
            <Text className="text-base font-medium !text-gray-900">
              New here? <Text className="font-bold !text-blue-600">Create account</Text>
            </Text>
          </Pressable>

          <View className="flex-row gap-4 opacity-60">
            <Pressable onPress={handleTermsPress}>
              <Text className="text-sm !text-gray-400">Terms</Text>
            </Pressable>
            <Pressable onPress={handlePrivacyPress}>
              <Text className="text-sm !text-gray-400">Privacy</Text>
            </Pressable>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
};
