import React, { useState } from "react";
import {
  View,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Box,
  Heading,
  VStack,
  Text,
  Input,
  InputField,
} from "@gluestack-ui/themed";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { AuthStackParamList } from "@/types/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { getAuthErrorMessage } from "@/lib/authErrors";

type Props = NativeStackScreenProps<
  AuthStackParamList,
  "UsernamePasswordSignIn"
>;

export const UsernamePasswordSignInScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both email/username and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await signIn(username, password);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleCreateAccount = () => {
    // Reset the navigation stack to Login → EnterEmail in one smooth action
    // This ensures back gesture goes to Login without visual glitches
    navigation.reset({
      index: 1,
      routes: [{ name: "Login" }, { name: "EnterEmail" }],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                  Welcome back
                </Heading>
                <Text size="md" className="!text-gray-600">
                  Sign in with your email or username.
                </Text>
              </VStack>

              {/* Form */}
              <VStack space="3xl" className="mt-8">
                <VStack space="md">
                  {/* Email or Username Input */}
                  <View>
                    <Input
                      variant="outline"
                      size="xl"
                      className={`rounded-xl ${
                        error ? "!border-red-500 border-2" : ""
                      }`}
                    >
                      <InputField
                        value={username}
                        onChangeText={(text) => {
                          setUsername(text.toLowerCase());
                          setError("");
                        }}
                        placeholder="Email or username"
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
                        className={`rounded-xl pr-12 ${
                          error ? "!border-red-500 border-2" : ""
                        }`}
                      >
                        <InputField
                          value={password}
                          onChangeText={(text) => {
                            setPassword(text);
                            setError("");
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

                <VStack space="md">
                  {/* Sign In Button */}
                  <Button
                    title="Sign In"
                    size="md"
                    onPress={handleSignIn}
                    disabled={loading}
                    loading={loading}
                    fullWidth
                  />

                  {/* Forgot Password Button */}
                  <Button
                    title="Forgot password?"
                    variant="ghost"
                    size="md"
                    onPress={handleForgotPassword}
                    disabled={loading}
                  />
                </VStack>
              </VStack>
            </View>

            {/* Footer - Create Account Link */}
            <View className="pb-4">
              <Pressable
                onPress={handleCreateAccount}
                disabled={loading}
                className="items-center py-4"
              >
                <Text className="text-base font-medium !text-gray-900">
                  Don't have an account?{" "}
                  <Text className="font-bold !text-blue-600">
                    Create account
                  </Text>
                </Text>
              </Pressable>
            </View>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
