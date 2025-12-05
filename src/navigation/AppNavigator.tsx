import { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { UsernamePasswordSignInScreen } from '@/screens/auth/UsernamePasswordSignInScreen';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { ChooseUsernameScreen } from '@/screens/auth/ChooseUsernameScreen';
import { CreatePasswordScreen } from '@/screens/auth/CreatePasswordScreen';
import { SelectGenderScreen } from '@/screens/onboarding/SelectGenderScreen';
import { UploadPhotoScreen } from '@/screens/onboarding/UploadPhotoScreen';
import { LobbyDetailScreen } from '@/screens/LobbyDetailScreen';
import { GameScreen } from '@/screens/GameScreen';
import { TabNavigator } from './TabNavigator';
import { Box, Spinner } from '@gluestack-ui/themed';
import type { RootStackParamList, AuthStackParamList, OnboardingStackParamList } from '@/types/navigation';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

// Auth Stack Component (includes signup flow)
const AuthNavigator = memo(() => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="ChooseUsername" component={ChooseUsernameScreen} />
      <AuthStack.Screen name="CreatePassword" component={CreatePasswordScreen} />
      <AuthStack.Screen name="SelectGender" component={SelectGenderScreen} />
      <AuthStack.Screen name="UploadPhoto" component={UploadPhotoScreen} />
      <AuthStack.Screen name="UsernamePasswordSignIn" component={UsernamePasswordSignInScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
});

AuthNavigator.displayName = 'AuthNavigator';

// Onboarding Stack Component (for OAuth users)
const OnboardingNavigator = memo(() => {
  return (
    <OnboardingStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="ChooseUsername"
    >
      <OnboardingStack.Screen 
        name="ChooseUsername" 
        component={ChooseUsernameScreen}
        initialParams={{ isSignupFlow: false }}
      />
      <OnboardingStack.Screen name="SelectGender" component={SelectGenderScreen} />
      <OnboardingStack.Screen name="UploadPhoto" component={UploadPhotoScreen} />
    </OnboardingStack.Navigator>
  );
});

OnboardingNavigator.displayName = 'OnboardingNavigator';

// Root App Navigator
export const AppNavigator = memo(() => {
  const { user, userDocument, loading } = useAuth();

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
      {!user ? (
        // Guest routes - not authenticated
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : userDocument?.status === 'incomplete' ? (
        // Authenticated but incomplete onboarding (OAuth users)
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        // Fully authenticated and onboarded
        <>
          <RootStack.Screen name="Tabs" component={TabNavigator} />
          <RootStack.Screen name="LobbyDetail" component={LobbyDetailScreen} />
          <RootStack.Screen name="Game" component={GameScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
});

AppNavigator.displayName = 'AppNavigator';
