import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Tab Navigator Param List
export type TabParamList = {
  Dashboard: undefined;
  Leaderboard: undefined;
  Play: undefined;
  Map: undefined;
  Profile: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

// Auth Stack (includes signup flow screens)
export type AuthStackParamList = {
  Login: undefined;
  EnterEmail: undefined;
  CreatePassword: { email: string };
  ChooseUsername: { email: string; password: string; isSignupFlow: boolean };
  SelectGender: { email: string; username: string; password: string };
  UploadPhoto: { email: string; username: string; password: string; gender: 'male' | 'female' };
  UsernamePasswordSignIn: undefined;
  ForgotPassword: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Onboarding Stack (for OAuth users)
export type OnboardingStackParamList = {
  ChooseUsername: { isSignupFlow: boolean };
  SelectGender: { username: string; password?: string };
  UploadPhoto: { username: string; password?: string; gender: 'male' | 'female' };
};

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

// Root Stack (wraps everything)
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  LobbyDetail: { roomCode: string };
  Game: { roomCode: string };
  GamePlay: { gameId: string };
  UserProfile: { username: string };
  Settings: undefined;
  EditProfile: undefined;
  EditDisplayName: { currentDisplayName: string };
  EditBio: { currentBio?: string };
  EditUsername: { currentUsername: string };
  EditGender: { currentGender: 'male' | 'female' };
  ChangePassword: undefined;
  ProgramPaddle: undefined;
  FollowList: { userId: string; initialTab?: 'following' | 'followers' };
  // Sessions (court params optional for auto-selection)
  CreateSession: { courtId?: string; courtName?: string };
  // Chat - either chatId (existing chat) or recipientUser (draft mode)
  ChatDetail: { 
    chatId?: string; 
    recipientUser?: { 
      uid: string; 
      username: string; 
      displayName: string; 
      photoURL: string | null;
    };
    searchMode?: boolean; // Open in search mode (from ChatInfo "Search" button)
  };
  // New Chat - select recipient screen
  NewChat: undefined;
  // Chat Info - settings and shared media
  ChatInfo: {
    chatId: string;
    displayName: string;
    photoURL: string | null;
    username?: string;
  };
  // Group creation flow
  CreateGroup: undefined;
  SetGroupName: {
    selectedUsers: Array<{
      uid: string;
      username: string;
      displayName: string;
      photoURL: string | null;
    }>;
  };
  // Group Info - settings and members
  GroupInfo: {
    chatId: string;
  };
  // Shared Media - grid of shared photos
  SharedMedia: {
    chatId: string;
    groupName: string;
  };
  // Edit Group - name and photo
  EditGroup: {
    chatId: string;
    currentName: string;
    currentPhotoURL: string | null;
  };
  // Map Filter - Gravity map filter screen
  MapFilter: {
    mode: 'activity' | 'social' | 'explore' | 'events' | 'train';
    activityFilter: 'all' | 'business';
    socialFilter: 'all' | 'following' | 'followers';
    exploreFilter: 'all' | 'indoor' | 'outdoor';
    eventsFilter: 'all' | 'upcoming' | 'this_week';
    trainFilter: 'beginner' | 'intermediate' | 'advanced';
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
