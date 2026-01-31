import { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading, Input, InputField, VStack, Text } from '@gluestack-ui/themed';
import { Eye, EyeOff } from 'lucide-react-native';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenHeader } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/common/useToast';

export const ChangePasswordScreen = ({ navigation }: RootStackScreenProps<'ChangePassword'>) => {
  const { firebaseUser } = useAuth();
  const toast = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const validate = (): boolean => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !newErrors.currentPassword && !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleChangePassword = async () => {
    if (!validate() || !firebaseUser || !firebaseUser.email) {
      return;
    }

    setLoading(true);

    try {
      // Reauthenticate with current password
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);

      toast.success('Password updated successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        setErrors(prev => ({ ...prev, currentPassword: 'Current password is incorrect' }));
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.');
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader title="Change Password" onLeftPress={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-6">
          {/* Header */}
          <VStack space="sm" className="mb-6">
            <Heading size="lg" className="!text-gray-900">
              Update Your Password
            </Heading>
            <Text size="sm" className="!text-gray-600">
              Enter your current password and choose a new one.
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="lg">
            {/* Current Password */}
            <VStack space="xs">
              <Text size="sm" className="font-medium !text-gray-700">
                Current Password
              </Text>
              <View className="relative">
                <Input
                  variant="outline"
                  size="lg"
                  className={`pr-12 ${errors.currentPassword ? '!border-red-500 border-2' : ''}`}
                >
                  <InputField
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      setErrors(prev => ({ ...prev, currentPassword: '' }));
                    }}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </Input>
                <View className="absolute top-0 bottom-0 justify-center right-4">
                  <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? (
                      <Eye size={20} color="#6B7280" />
                    ) : (
                      <EyeOff size={20} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
              </View>
              {errors.currentPassword ? (
                <Text size="sm" className="!text-red-600">
                  {errors.currentPassword}
                </Text>
              ) : null}
            </VStack>

            {/* New Password */}
            <VStack space="xs">
              <Text size="sm" className="font-medium !text-gray-700">
                New Password
              </Text>
              <View className="relative">
                <Input
                  variant="outline"
                  size="lg"
                  className={`pr-12 ${errors.newPassword ? '!border-red-500 border-2' : ''}`}
                >
                  <InputField
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setErrors(prev => ({ ...prev, newPassword: '' }));
                    }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </Input>
                <View className="absolute top-0 bottom-0 justify-center right-4">
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? (
                      <Eye size={20} color="#6B7280" />
                    ) : (
                      <EyeOff size={20} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
              </View>
              {errors.newPassword ? (
                <Text size="sm" className="!text-red-600">
                  {errors.newPassword}
                </Text>
              ) : null}
            </VStack>

            {/* Confirm Password */}
            <VStack space="xs">
              <Text size="sm" className="font-medium !text-gray-700">
                Confirm New Password
              </Text>
              <View className="relative">
                <Input
                  variant="outline"
                  size="lg"
                  className={`pr-12 ${errors.confirmPassword ? '!border-red-500 border-2' : ''}`}
                >
                  <InputField
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </Input>
                <View className="absolute top-0 bottom-0 justify-center right-4">
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <Eye size={20} color="#6B7280" />
                    ) : (
                      <EyeOff size={20} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
              </View>
              {errors.confirmPassword ? (
                <Text size="sm" className="!text-red-600">
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </VStack>

            {/* Submit Button */}
            <View className="mt-4">
              <Button
                title="Update Password"
                size="md"
                onPress={handleChangePassword}
                disabled={loading}
                loading={loading}
                fullWidth
              />
            </View>
          </VStack>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
