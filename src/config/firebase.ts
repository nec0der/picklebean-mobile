import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Environment detection
export const ENV = process.env.EXPO_PUBLIC_ENV || 'development';
export const IS_DEV = ENV === 'development';
export const IS_PROD = ENV === 'production';

// Log environment information in development
if (__DEV__) {
  console.log('='.repeat(50));
  console.log('🔥 Firebase Configuration');
  console.log('='.repeat(50));
  console.log('Environment:', ENV.toUpperCase());
  console.log('Project ID:', firebaseConfig.projectId);
  console.log('Auth Domain:', firebaseConfig.authDomain);
  console.log('='.repeat(50));

  if (IS_PROD) {
    console.warn('⚠️  WARNING: Using PRODUCTION Firebase!');
    console.warn('⚠️  Be careful - this affects real user data!');
    console.log('='.repeat(50));
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native AsyncStorage persistence
// Note: Requires tsconfig.json path mapping to @firebase/auth React Native types
// This enables "stay logged in" functionality across app restarts
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
