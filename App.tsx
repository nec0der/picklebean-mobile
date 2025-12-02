import './global.css';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppNavigator } from '@/navigation/AppNavigator';
import { configureGoogleSignIn } from '@/lib/oauth';

export default function App() {
  // Initialize Google Sign-In configuration on app startup
  useEffect(() => {
    console.log('🚀 [App] Initializing Google Sign-In...');
    configureGoogleSignIn();
    console.log('✅ [App] Google Sign-In configured');
  }, []);

  return (
    <GluestackUIProvider config={config}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
