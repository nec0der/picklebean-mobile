import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Conditionally import NFC manager - not available in Expo Go
let NfcManager: any = null;
let NfcEvents: any = null;
let Ndef: any = null;

try {
  const nfcModule = require('react-native-nfc-manager');
  NfcManager = nfcModule.default;
  NfcEvents = nfcModule.NfcEvents;
  Ndef = nfcModule.Ndef;
} catch (e) {
  console.log('📱 NFC not available (Expo Go or unsupported device) - feature will be skipped');
}

interface UseNFCParams {
  handler: (url: string) => Promise<boolean>;
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;
}

interface UseNFCReturn {
  isSupported: boolean;
  error: string | null;
  startScanning: () => void;
  stopScanning: () => void;
}

/**
 * Hook to handle NFC tag reading using event-driven continuous scanning
 * Uses registerTagEvent + setEventListener for iOS-compatible multi-scanning
 */
export const useNFC = ({ handler, isScanning, setIsScanning }: UseNFCParams): UseNFCReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep handler ref updated without causing effect re-runs
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Effect 1: Initialize NFC on mount
  useEffect(() => {
    let isMounted = true;

    const initNFC = async (): Promise<void> => {
      // Skip if NFC module not available (Expo Go)
      if (!NfcManager) {
        if (isMounted) {
          setIsSupported(false);
          setError('NFC not available - build required');
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
          console.log('✅ NFC Manager initialized');
        }
      } catch (err) {
        console.error('NFC initialization error:', err);
        if (isMounted) {
          setError('Failed to initialize NFC');
        }
      }
    };

    if (Platform.OS !== 'web') {
      initNFC();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Effect 2: Event-driven scanning (iOS way)
  useEffect(() => {
    if (!isScanning || !handlerRef.current || !NfcManager || !isSupported) {
      console.log('⏸️  Not starting scan:', { 
        isScanning, 
        hasHandler: !!handlerRef.current, 
        hasNfcManager: !!NfcManager, 
        isSupported 
      });
      return;
    }

    console.log('🚀 Starting event-driven NFC scanning...');

    // Define event handler
    const handleTagDiscovered = async (tag: any) => {
      console.log('📱 NFC tag discovered via event!', tag);
      
      try {
        if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
          const record = tag.ndefMessage[0];
          const payload = record.payload;
          
          if (payload) {
            const payloadArray = new Uint8Array(payload);
            const text = Ndef.uri.decodePayload(payloadArray);
            
            if (text) {
              console.log('✅ Decoded URI:', text);
              
              // Haptic feedback for successful scan
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              
              // Call handler via ref
              const currentHandler = handlerRef.current;
              if (currentHandler) {
                const shouldContinue = await currentHandler(text);
                
                if (!shouldContinue) {
                  console.log('🛑 Callback returned false, stopping scan');
                  setIsScanning(false);
                }
              }
            } else {
              console.warn('⚠️  No URI payload found in tag');
            }
          }
        } else {
          console.warn('⚠️  No NDEF message in tag');
        }
      } catch (err) {
        console.error('🚨 Error processing tag:', err);
      }
    };

    // Setup event listeners
    NfcManager.setEventListener(NfcEvents.DiscoverTag, handleTagDiscovered);
    
    // Listen for session closed (iOS cancel button)
    NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
      console.log('📴 NFC session closed by user (Cancel pressed)');
      setIsScanning(false);
    });
    
    // Then register for tag events (continuous scanning)
    NfcManager.registerTagEvent({
      alertMessage: 'Tap paddles to join! Vibration = success.',
      invalidateAfterFirstRead: false,  // Keep scanning!
    })
      .then(() => {
        console.log('✅ NFC tag event registered successfully');
      })
      .catch((err: any) => {
        console.error('🚨 Error registering tag event:', err);
        setError('Failed to start NFC scanning');
        setIsScanning(false);
      });

    // Cleanup function - don't block, run async
    return () => {
      console.log('🧹 Cleaning up NFC event scanning...');
      
      // Remove event listeners immediately (synchronous)
      if (NfcManager && NfcEvents) {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        NfcManager.setEventListener(NfcEvents.SessionClosed, null);
      }
      
      // Unregister tag events asynchronously (don't wait)
      if (NfcManager) {
        // Fire and forget - don't block cleanup
        NfcManager.unregisterTagEvent()
          .then(() => console.log('✅ NFC tag event unregistered'))
          .catch((err: any) => {
            console.log('⚠️  Error unregistering (may be expected):', err?.message);
          });
      }
    };
  }, [isScanning, isSupported, setIsScanning]);

  // Start scanning function
  const startScanning = (): void => {
    console.log('▶️  Start scanning requested');
    
    if (!NfcManager || !isSupported) {
      console.warn('NFC not available');
      return;
    }

    if (isScanning) {
      console.warn('Already scanning...');
      return;
    }

    // Toggle parent state (effect will handle registration)
    setIsScanning(true);
  };

  // Stop scanning function
  const stopScanning = (): void => {
    console.log('⏹️  Stop scanning requested');
    
    if (!isScanning) {
      console.log('⏸️  Already stopped');
      return;
    }

    // Toggle parent state (effect cleanup will handle unregistration)
    setIsScanning(false);
  };

  return {
    isSupported,
    error,
    startScanning,
    stopScanning,
  };
};

export type { UseNFCReturn, UseNFCParams };
