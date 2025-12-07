import { useState, useEffect, useCallback } from 'react';
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

  // Initialize NFC manager on mount
  useEffect(() => {
    let isMounted = true;

    const initNFC = async (): Promise<void> => {
      console.log('🔷 [NFC Writer] Starting initialization...');
      try {
        // Check if NFC is supported
        console.log('🔷 [NFC Writer] Checking isSupported...');
        const supported = await NfcManager.isSupported();
        console.log('🔷 [NFC Writer] isSupported result:', supported);
        
        if (isMounted && supported) {
          // Start NFC manager
          console.log('🔷 [NFC Writer] Calling NfcManager.start()...');
          await NfcManager.start();
          console.log('✅ [NFC Writer] Initialization complete - NFC Manager started');
        } else if (!supported) {
          console.warn('⚠️ [NFC Writer] Device does not support NFC');
        } else {
          console.log('🔷 [NFC Writer] Component unmounted before start');
        }
      } catch (err) {
        console.error('❌ [NFC Writer] Initialization error:', err);
      }
    };

    initNFC();

    return () => {
      console.log('🔷 [NFC Writer] Cleanup - unmounting');
      isMounted = false;
    };
  }, []);

  const writeProfileUrl = useCallback(async (url: string): Promise<boolean> => {
    console.log('🟢 [NFC Write] Starting write process for URL:', url);
    try {
      setIsWriting(true);

      // Check if NFC is supported
      console.log('🟢 [NFC Write] Checking if NFC is supported...');
      const isSupported = await NfcManager.isSupported();
      console.log('🟢 [NFC Write] isSupported result:', isSupported);
      
      if (!isSupported) {
        console.warn('⚠️ [NFC Write] Device does not support NFC - showing alert');
        Alert.alert(
          'NFC Not Supported',
          'Your device does not support NFC functionality.'
        );
        return false;
      }

      // Check if NFC is enabled
      console.log('🟢 [NFC Write] Checking if NFC is enabled...');
      const isEnabled = await NfcManager.isEnabled();
      console.log('🟢 [NFC Write] isEnabled result:', isEnabled);
      
      if (!isEnabled) {
        console.warn('⚠️ [NFC Write] NFC is disabled - showing alert');
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
      console.log('🟢 [NFC Write] Requesting NFC technology...');
      await NfcManager.requestTechnology(NfcTech.Ndef);
      console.log('🟢 [NFC Write] NFC technology acquired successfully');

      // Create NDEF message with URL
      console.log('🟢 [NFC Write] Encoding NDEF message...');
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);
      console.log('🟢 [NFC Write] NDEF message encoded, bytes:', bytes?.length || 0);

      if (!bytes) {
        throw new Error('Failed to encode NFC message');
      }

      // Write to tag
      console.log('🟢 [NFC Write] Writing to NFC tag...');
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      console.log('✅ [NFC Write] Successfully wrote to NFC tag!');

      // Success!
      Alert.alert(
        'Success! 🎉',
        'Your paddle has been programmed! Anyone can now tap their phone to your paddle to view your profile.',
        [{ text: 'Done', style: 'default' }]
      );

      return true;
    } catch (error) {
      console.error('❌ [NFC Write] Error occurred:', error);
      console.error('❌ [NFC Write] Error details:', JSON.stringify(error, null, 2));

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
