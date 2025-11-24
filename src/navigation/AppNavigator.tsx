import { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { ChooseUsernameScreen } from '@/screens/auth/ChooseUsernameScreen';
import { CreatePasswordScreen } from '@/screens/auth/CreatePasswordScreen';
import { SelectGenderScreen } from '@/screens/onboarding/SelectGenderScreen';
import { UploadPhotoScreen } from '@/screens/onboarding/UploadPhotoScreen';
import { LobbyDetailScreen } from '@/screens/LobbyDetailScreen';
import { GameScreen } from '@/screens/GameScreen';
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
      <AuthStack.Screen name="ChooseUsername" component={ChooseUsernameScreen} />
      <AuthStack.Screen name="CreatePassword" component={CreatePasswordScreen} />
      <AuthStack.Screen name="SelectGender" component={SelectGenderScreen} />
      <AuthStack.Screen name="UploadPhoto" component={UploadPhotoScreen} />
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
      <Box className="items-center justify-center flex-1 bg-white">
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
          <RootStack.Screen name="Game" component={GameScreen} />
        </>
      ) : (
        // Guest routes
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
});

AppNavigator.displayName = 'AppNavigator';
