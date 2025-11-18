import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider, Toast, ToastTitle, ToastDescription } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppNavigator } from '@/navigation/AppNavigator';

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
            <Toast />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
