import { memo, useState, useCallback } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Input, InputField } from '@gluestack-ui/themed';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { ScreenHeader, LoadingSpinner } from '@/components/common';
import { useToast } from '@/hooks/common/useToast';

export const EditDisplayNameScreen = memo(({ navigation, route }: RootStackScreenProps<'EditDisplayName'>) => {
  const { currentDisplayName } = route.params;
  const { userDocument } = useAuth();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = useCallback(async () => {
    if (!userDocument?.uid) {
      toast.error('User not found');
      return;
    }

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      toast.error('Display name is required');
      return;
    }

    if (trimmedName === currentDisplayName) {
      navigation.goBack();
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      await updateUserProfile(userDocument.uid, {
        displayName: trimmedName,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Display name updated');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating display name:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Failed to update display name');
    } finally {
      setIsSaving(false);
    }
  }, [displayName, currentDisplayName, userDocument, navigation, toast]);

  const hasChanges = displayName.trim() !== currentDisplayName;
  const canSave = hasChanges && displayName.trim().length > 0 && !isSaving;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="Display Name"
        onLeftPress={handleBack}
        rightComponent={
          isSaving ? (
            <ActivityIndicator size="small" color="#16a34a" />
          ) : (
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              className="active:opacity-70"
            >
              <Text className={`text-base font-semibold ${
                canSave ? '!text-green-600' : '!text-gray-400'
              }`}>
                Save
              </Text>
            </Pressable>
          )
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-6">
          <Text className="mb-4 text-sm !text-gray-600">
            This is your full name that will be displayed on your profile.
          </Text>

          <Input variant="outline" size="xl" className="rounded-xl">
            <InputField
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your full name"
              autoCapitalize="words"
              maxLength={50}
              autoFocus
            />
          </Input>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

EditDisplayNameScreen.displayName = 'EditDisplayNameScreen';
