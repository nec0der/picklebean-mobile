import { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { isGravity } from '@/config/product';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { EnterEmailScreen } from '@/screens/auth/EnterEmailScreen';
import { UsernamePasswordSignInScreen } from '@/screens/auth/UsernamePasswordSignInScreen';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { ChooseUsernameScreen } from '@/screens/auth/ChooseUsernameScreen';
import { CreatePasswordScreen } from '@/screens/auth/CreatePasswordScreen';
import { SelectGenderScreen } from '@/screens/onboarding/SelectGenderScreen';
import { UploadPhotoScreen } from '@/screens/onboarding/UploadPhotoScreen';
import { LobbyDetailScreen } from '@/screens/LobbyDetailScreen';
import { GameScreen } from '@/screens/GameScreen';
import { UserProfileScreen } from '@/screens/UserProfileScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { GravitySettingsScreen } from '@/screens/gravity/GravitySettingsScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { EditDisplayNameScreen } from '@/screens/EditDisplayNameScreen';
import { EditBioScreen } from '@/screens/EditBioScreen';
import { EditUsernameScreen } from '@/screens/EditUsernameScreen';
import { EditGenderScreen } from '@/screens/EditGenderScreen';
import { TapToPlayScreen } from '@/screens/TapToPlayScreen';
import { FollowListScreen } from '@/screens/FollowListScreen';
import { ChangePasswordScreen } from '@/screens/settings/ChangePasswordScreen';
import { CreateSessionScreen } from '@/screens/gravity/CreateSessionScreen';
import { MapFilterScreen } from '@/screens/gravity/MapFilterScreen';
import { ChatDetailScreen } from '@/screens/ChatDetailScreen';
import { NewChatScreen } from '@/screens/NewChatScreen';
import { ChatInfoScreen } from '@/screens/ChatInfoScreen';
import { CreateGroupScreen } from '@/screens/CreateGroupScreen';
import { SetGroupNameScreen } from '@/screens/SetGroupNameScreen';
import { GroupInfoScreen } from '@/screens/GroupInfoScreen';
import { SharedMediaScreen } from '@/screens/SharedMediaScreen';
import { EditGroupScreen } from '@/screens/EditGroupScreen';
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
      <AuthStack.Screen name="EnterEmail" component={EnterEmailScreen} />
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
          <RootStack.Screen name="UserProfile" component={UserProfileScreen} />
          <RootStack.Screen 
            name="Settings" 
            component={isGravity ? GravitySettingsScreen : SettingsScreen} 
          />
          <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
          <RootStack.Screen name="EditDisplayName" component={EditDisplayNameScreen} />
          <RootStack.Screen name="EditBio" component={EditBioScreen} />
          <RootStack.Screen name="EditUsername" component={EditUsernameScreen} />
          <RootStack.Screen name="EditGender" component={EditGenderScreen} />
          <RootStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <RootStack.Screen name="FollowList" component={FollowListScreen} />
          <RootStack.Screen name="ProgramPaddle" component={TapToPlayScreen} />
          <RootStack.Screen name="CreateSession" component={CreateSessionScreen} />
          <RootStack.Screen name="MapFilter" component={MapFilterScreen} />
          <RootStack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <RootStack.Screen name="NewChat" component={NewChatScreen} />
          <RootStack.Screen name="ChatInfo" component={ChatInfoScreen} />
          <RootStack.Screen name="CreateGroup" component={CreateGroupScreen} />
          <RootStack.Screen name="SetGroupName" component={SetGroupNameScreen} />
          <RootStack.Screen name="GroupInfo" component={GroupInfoScreen} />
          <RootStack.Screen name="SharedMedia" component={SharedMediaScreen} />
          <RootStack.Screen 
            name="EditGroup" 
            component={EditGroupScreen} 
            options={{ presentation: 'modal' }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
});

AppNavigator.displayName = 'AppNavigator';
