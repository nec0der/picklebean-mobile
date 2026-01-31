import { memo, useState, useCallback } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Textarea, TextareaInput } from '@gluestack-ui/themed';
import type { RootStackScreenProps } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/services/userService';
import { ScreenHeader } from '@/components/common';
import { useToast } from '@/hooks/common/useToast';

export const EditBioScreen = memo(({ navigation, route }: RootStackScreenProps<'EditBio'>) => {
  const { currentBio } = route.params;
  const { userDocument } = useAuth();
  const toast = useToast();

  const [bio, setBio] = useState(currentBio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = useCallback(async () => {
    if (!userDocument?.uid) {
      toast.error('User not found');
      return;
    }

    const trimmedBio = bio.trim();

    if (trimmedBio === (currentBio || '')) {
      navigation.goBack();
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      await updateUserProfile(userDocument.uid, {
        bio: trimmedBio,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Bio updated');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating bio:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Failed to update bio');
    } finally {
      setIsSaving(false);
    }
  }, [bio, currentBio, userDocument, navigation, toast]);

  const hasChanges = bio.trim() !== (currentBio || '');
  const canSave = hasChanges && !isSaving;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="Bio"
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
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm !text-gray-600">
              Tell others about yourself
            </Text>
            <Text className="text-xs !text-gray-500">
              {bio.length}/150
            </Text>
          </View>

          <Textarea size="lg" className="min-h-[150px] rounded-xl">
            <TextareaInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              maxLength={150}
              multiline
              numberOfLines={8}
              autoFocus
            />
          </Textarea>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

EditBioScreen.displayName = 'EditBioScreen';
