import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Tab Navigator Param List
export type TabParamList = {
  Dashboard: undefined;
  Leaderboard: undefined;
  Play: undefined;
  History: undefined;
  Profile: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  SelectGender: { username: string; password: string };
  UploadPhoto: { username: string; password: string; gender: 'male' | 'female' };
  ForgotPassword: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Root Stack (wraps everything)
export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  LobbyDetail: { roomCode: string };
  Game: { roomCode: string };
  GamePlay: { gameId: string };
  UserProfile: { userId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
