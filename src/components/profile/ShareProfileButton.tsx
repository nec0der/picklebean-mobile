import { memo } from 'react';
import { Share, Alert } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';

interface ShareProfileButtonProps {
  userId: string;
  displayName: string;
}

const PROFILE_BASE_URL = 'https://picklebean-ranking-app.web.app/profile';

/**
 * Button to share user's profile via native share sheet
 */
export const ShareProfileButton = memo(({ userId, displayName }: ShareProfileButtonProps) => {
  const handleShare = async (): Promise<void> => {
    const profileUrl = `${PROFILE_BASE_URL}/${userId}`;
    const message = `Check out ${displayName}'s Picklebean profile!`;

    try {
      const result = await Share.share({
        message: `${message}\n${profileUrl}`,
        url: profileUrl, // iOS specific
        title: `${displayName} - Picklebean Profile`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Profile shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Failed to share profile. Please try again.');
    }
  };

  return (
    <Button
      onPress={handleShare}
      variant="outline"
      size="md"
      className="flex-row items-center"
    >
      <Share2 size={18} color="#3B82F6" className="mr-2" />
      <ButtonText className="!text-blue-600">Share Profile</ButtonText>
    </Button>
  );
});

ShareProfileButton.displayName = 'ShareProfileButton';

export type { ShareProfileButtonProps };
