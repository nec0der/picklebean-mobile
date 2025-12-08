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
      console.error('❌ [NFC Write] Error type:', typeof error);
      console.error('❌ [NFC Write] Error constructor:', error?.constructor?.name);

      // Check for UserCancel error from NFC library (top priority)
      if (error?.constructor?.name === 'UserCancel') {
        console.log('ℹ️ [NFC Write] UserCancel detected - returning silently');
        return false;
      }

      // Check if error is from user cancellation
      // iOS NFC cancellation can also throw other patterns
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorString = JSON.stringify(error);
      
      // Detect other cancellation scenarios
      const isCancellation = 
        !error || // Null/undefined error
        errorString === '{}' || // Empty object
        errorString === 'null' || // Null
        errorMessage.includes('cancelled') ||
        errorMessage.includes('Cancel') ||
        errorMessage.includes('Session invalidated') ||
        errorMessage.includes('user') ||
        errorMessage.toLowerCase().includes('abort');

      if (isCancellation) {
        console.log('ℹ️ [NFC Write] User cancelled scan - returning silently');
        return false;
      }

      // Handle specific error types
      if (error instanceof Error) {
        if (errorMessage.includes('not writable') || errorMessage.includes('readonly')) {
          Alert.alert(
            'Tag Not Writable',
            'This NFC tag is read-only and cannot be programmed. Please use a blank or rewritable NFC tag.'
          );
          return false;
        }

        if (errorMessage.includes('Tag connection lost') || errorMessage.includes('connection')) {
          Alert.alert(
            'Connection Lost',
            'Lost connection to the NFC tag. Please try again and keep your phone steady against the tag.'
          );
          return false;
        }
        
        if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          Alert.alert(
            'Scan Timed Out',
            'No tag detected. Make sure to hold the top of your phone against the NFC tag for 2-3 seconds.'
          );
          return false;
        }
      }

      // Only show generic error for actual errors (not cancellation)
      console.error('❌ [NFC Write] Showing error alert for:', error);
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
