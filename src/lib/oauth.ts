import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithCredential,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/config/firebase';

// Configure Google Sign-In
// Note: webClientId should come from Firebase Console
export const configureGoogleSignIn = (): void => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    offlineAccess: true,
  });
};

export interface OAuthUserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
}

/**
 * Sign in with Google
 * @returns Firebase user info
 */
export const signInWithGoogle = async (): Promise<OAuthUserInfo> => {
  try {
    // Check if Google Play Services are available (Android)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get user info from Google
    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token received from Google');
    }

    // Create Firebase credential
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, googleCredential);
    const user = userCredential.user;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: 'google.com',
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    
    // Handle specific Google Sign-In errors
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw new Error('Sign in was cancelled');
    } else if (error.code === 'IN_PROGRESS') {
      throw new Error('Sign in already in progress');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw new Error('Google Play Services not available');
    }
    
    throw new Error('Failed to sign in with Google');
  }
};

/**
 * Sign in with Apple (iOS only)
 * @returns Firebase user info
 */
export const signInWithApple = async (): Promise<OAuthUserInfo> => {
  try {
    // Check if Apple Authentication is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    // Request Apple authentication
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Create Firebase credential
    const { identityToken, user: appleUserId } = credential;

    if (!identityToken) {
      throw new Error('No identity token received from Apple');
    }

    const provider = new OAuthProvider('apple.com');
    const oauthCredential = provider.credential({
      idToken: identityToken,
    });

    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, oauthCredential);
    const user = userCredential.user;

    // Apple only provides name on first sign-in
    const displayName = credential.fullName
      ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
      : user.displayName;

    return {
      uid: user.uid,
      email: credential.email || user.email,
      displayName: displayName || null,
      photoURL: user.photoURL,
      providerId: 'apple.com',
    };
  } catch (error: any) {
    console.error('Apple Sign-In Error:', error);

    // Handle specific Apple Sign-In errors
    if (error.code === 'ERR_CANCELED') {
      throw new Error('Sign in was cancelled');
    }

    throw new Error('Failed to sign in with Apple');
  }
};

/**
 * Sign out from Google (clears Google Sign-In state)
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
};

/**
 * Check if Apple Sign-In is available
 */
export const isAppleSignInAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
};
