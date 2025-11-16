import { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { SignupScreen } from '@/screens/auth/SignupScreen';
import { LobbyDetailScreen } from '@/screens/LobbyDetailScreen';
import { TabNavigator } from './TabNavigator';
import { Box, Spinner } from '@gluestack-ui/themed';
import type { RootStackParamList, AuthStackParamList } from '@/types/navigation';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// Auth Stack Component
const AuthNavigator = memo(() => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={SignupScreen} />
    </AuthStack.Navigator>
  );
});

AuthNavigator.displayName = 'AuthNavigator';

// Root App Navigator
export const AppNavigator = memo(() => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Box className="flex-1 justify-center items-center bg-white">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Authenticated routes
        <>
          <RootStack.Screen name="Tabs" component={TabNavigator} />
          <RootStack.Screen name="LobbyDetail" component={LobbyDetailScreen} />
        </>
      ) : (
        // Guest routes
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
});

AppNavigator.displayName = 'AppNavigator';
