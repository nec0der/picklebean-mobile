import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

interface UseNFCWriterReturn {
  isWriting: boolean;
  writeProfileUrl: (url: string) => Promise<boolean>;
  cancelWrite: () => Promise<void>;
}

/**
 * Hook for writing profile URLs to NFC tags
 * Handles both iOS and Android differences
 */
export const useNFCWriter = (): UseNFCWriterReturn => {
  const [isWriting, setIsWriting] = useState(false);

  const writeProfileUrl = useCallback(async (url: string): Promise<boolean> => {
    try {
      setIsWriting(true);

      // Check if NFC is supported
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        Alert.alert(
          'NFC Not Supported',
          'Your device does not support NFC functionality.'
        );
        return false;
      }

      // Check if NFC is enabled
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        Alert.alert(
          'NFC Disabled',
          'Please enable NFC in your device settings to program your paddle.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  NfcManager.goToNfcSetting();
                } else {
                  NfcManager.goToNfcSetting();
                }
              },
            },
          ]
        );
        return false;
      }

      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Create NDEF message with URL
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);

      if (!bytes) {
        throw new Error('Failed to encode NFC message');
      }

      // Write to tag
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      // Success!
      Alert.alert(
        'Success! 🎉',
        'Your paddle has been programmed! Anyone can now tap their phone to your paddle to view your profile.',
        [{ text: 'Done', style: 'default' }]
      );

      return true;
    } catch (error) {
      console.error('NFC Write Error:', error);

      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes('cancelled') || error.message.includes('Session invalidated')) {
          // User cancelled - no alert needed
          return false;
        }

        if (error.message.includes('not writable') || error.message.includes('readonly')) {
          Alert.alert(
            'Tag Not Writable',
            'This NFC tag is read-only and cannot be programmed. Please use a blank or rewritable NFC tag.'
          );
          return false;
        }

        if (error.message.includes('Tag connection lost')) {
          Alert.alert(
            'Connection Lost',
            'Lost connection to the NFC tag. Please try again and keep your phone steady against the tag.'
          );
          return false;
        }
      }

      // Generic error
      Alert.alert(
        'Write Failed',
        'Failed to write to NFC tag. Please try again and ensure the tag is writable.'
      );

      return false;
    } finally {
      // Clean up NFC session
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (err) {
        // Ignore cleanup errors
        console.log('Cleanup error (safe to ignore):', err);
      }
      setIsWriting(false);
    }
  }, []);

  const cancelWrite = useCallback(async (): Promise<void> => {
    try {
      await NfcManager.cancelTechnologyRequest();
      setIsWriting(false);
    } catch (error) {
      console.error('Error cancelling NFC write:', error);
    }
  }, []);

  return {
    isWriting,
    writeProfileUrl,
    cancelWrite,
  };
};
