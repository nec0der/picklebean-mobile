import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/config/firebase';
import type { User } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = useCallback(async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(
    async (email: string, password: string, displayName: string): Promise<void> => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user: firebaseUser } = userCredential;

        // Update Firebase Auth profile
        await updateProfile(firebaseUser, { displayName });

        // Create user document in Firestore
        const userData = {
          email: firebaseUser.email || email,
          displayName,
          photoURL: null,
          rating: 1000,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(firestore, 'users', firebaseUser.uid), userData);
      } catch (error) {
        console.error('Error signing up:', error);
        throw error;
      }
    },
    []
  );

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(
    async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
      if (!firebaseUser) {
        throw new Error('No user logged in');
      }

      try {
        await updateProfile(firebaseUser, updates);

        // Update Firestore document
        await setDoc(
          doc(firestore, 'users', firebaseUser.uid),
          {
            ...updates,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        // Refresh user data
        const updatedUser = await fetchUserData(firebaseUser.uid);
        setUser(updatedUser);
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },
    [firebaseUser, fetchUserData]
  );

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
