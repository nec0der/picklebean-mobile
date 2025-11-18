import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Conditionally import NFC manager - not available in Expo Go
let NfcManager: any = null;
let NfcTech: any = null;
let Ndef: any = null;

try {
  const nfcModule = require('react-native-nfc-manager');
  NfcManager = nfcModule.default;
  NfcTech = nfcModule.NfcTech;
  Ndef = nfcModule.Ndef;
} catch (e) {
  console.log('📱 NFC not available (Expo Go or unsupported device) - feature will be skipped');
}

interface UseNFCOptions {
  onTagRead: (url: string) => void;
  enabled?: boolean;
}

interface UseNFCReturn {
  isSupported: boolean;
  isEnabled: boolean;
  error: string | null;
}

/**
 * Hook to handle NFC tag reading
 * Automatically starts listening when enabled
 * Cleans up on unmount
 */
export const useNFC = ({ onTagRead, enabled = true }: UseNFCOptions): UseNFCReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initNFC = async (): Promise<void> => {
      // Skip if NFC module not available (Expo Go)
      if (!NfcManager) {
        if (isMounted) {
          setIsSupported(false);
          setError('NFC not available in Expo Go - will work after building with EAS');
        }
        return;
      }

      try {
        // Check if NFC is supported
        const supported = await NfcManager.isSupported();
        
        if (isMounted) {
          setIsSupported(supported);
          
          if (!supported) {
            setError('NFC is not supported on this device');
            return;
          }

          // Start NFC manager
          await NfcManager.start();
          setIsEnabled(true);
        }
      } catch (err) {
        console.error('NFC initialization error:', err);
        if (isMounted) {
          setError('Failed to initialize NFC');
          setIsEnabled(false);
        }
      }
    };

    if (enabled && Platform.OS !== 'web') {
      initNFC();
    }

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (!isSupported || !isEnabled || !enabled) {
      return;
    }

    let isListening = true;

    const readTag = async (): Promise<void> => {
      try {
        // Register for NFC tags
        await NfcManager.requestTechnology(NfcTech.Ndef);

        // Read NDEF message
        const tag = await NfcManager.getTag();
        
        if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
          // Parse NDEF records to find URI
          for (const record of tag.ndefMessage) {
            const payload = record.payload;
            
            if (payload) {
              // Convert payload to string
              // NDEF URI records have a prefix byte followed by URI
              const payloadArray = new Uint8Array(payload);
              const text = Ndef.uri.decodePayload(payloadArray);
              
              if (text && isListening) {
                onTagRead(text);
                break;
              }
            }
          }
        }
      } catch (err) {
        console.error('NFC read error:', err);
      } finally {
        // Clean up and prepare for next scan
        try {
          await NfcManager.cancelTechnologyRequest();
        } catch (e) {
          console.error('Error canceling NFC request:', e);
        }
        
        // Continue listening if still mounted
        if (isListening) {
          setTimeout(() => {
            if (isListening) {
              readTag();
            }
          }, 100);
        }
      }
    };

    // Start listening
    readTag();

    return () => {
      isListening = false;
      if (NfcManager) {
        NfcManager.cancelTechnologyRequest().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, [isSupported, isEnabled, enabled, onTagRead]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isEnabled && NfcManager) {
        NfcManager.cancelTechnologyRequest().catch(() => {
          // Ignore cleanup errors  
        });
      }
    };
  }, [isEnabled]);

  return {
    isSupported,
    isEnabled,
    error,
  };
};

export type { UseNFCOptions, UseNFCReturn };
