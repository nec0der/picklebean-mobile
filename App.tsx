import './global.css';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AlertSheet } from '@/components/common/AlertSheet';
import { configureGoogleSignIn } from '@/lib/oauth';

export default function App() {
  // Initialize Google Sign-In configuration on app startup
  useEffect(() => {
    console.log('🚀 [App] Initializing Google Sign-In...');
    configureGoogleSignIn();
    console.log('✅ [App] Google Sign-In configured');
  }, []);

  // Deep linking configuration
  const linking = {
    prefixes: [
      'picklebean://',
      'https://picklebean-ranking-app.web.app',
      'http://localhost:5173',
    ],
    config: {
      screens: {
        LobbyDetail: {
          path: 'lobby/:roomCode',
          parse: {
            roomCode: (roomCode: string) => roomCode,
          },
        },
      },
    },
  };

  return (
    <GluestackUIProvider config={config}>
      <SafeAreaProvider>
        <AuthProvider>
          <AlertProvider>
            <NavigationContainer linking={linking}>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
            <AlertSheet />
          </AlertProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
