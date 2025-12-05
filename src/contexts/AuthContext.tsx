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
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/config/firebase';
import type { User, UserDocument } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  userDocument: UserDocument | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signUpWithUsername: (username: string, password: string, gender: 'male' | 'female', photoUri: string | null) => Promise<void>;
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
  const [userDocument, setUserDocument] = useState<UserDocument | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = useCallback(async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      console.log('userDoc.data()', userDoc.data())
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  // Fetch user document from Firestore
  const fetchUserDocument = useCallback(async (uid: string): Promise<UserDocument | null> => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));

      if (userDoc.exists()) {
        return { uid: userDoc.id, ...userDoc.data() } as UserDocument;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user document:', error);
      return null;
    }
  }, []);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
        const userDoc = await fetchUserDocument(firebaseUser.uid);
        setUser(userData);
        setUserDocument(userDoc);
      } else {
        setUser(null);
        setUserDocument(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData, fetchUserDocument]);

  // Real-time listener for user document changes
  // This enables automatic navigation when status changes (e.g., incomplete -> approved)
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = onSnapshot(
      doc(firestore, 'users', firebaseUser.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const updatedUserDoc = { uid: snapshot.id, ...snapshot.data() } as UserDocument;
          setUserDocument(updatedUserDoc);
          
          // Also update user state for consistency
          const updatedUser = { id: snapshot.id, ...snapshot.data() } as User;
          setUser(updatedUser);
        }
      },
      (error) => {
        console.error('Error listening to user document:', error);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  // Sign in with username and password (converts username to internal email)
  const signIn = useCallback(async (usernameOrEmail: string, password: string): Promise<void> => {
    try {
      const { usernameToEmail } = await import('@/lib/username');
      
      // Convert username to email if needed
      // If input already looks like an email (contains @ but not our domain), use as-is
      // Otherwise, treat as username and convert to @picklebean.app
      const email = usernameOrEmail.includes('@') && !usernameOrEmail.includes('@picklebean.app')
        ? usernameOrEmail  // Already an email (OAuth users)
        : usernameToEmail(usernameOrEmail); // Username → username@picklebean.app
      
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

  // Sign up with username (username-based auth)
  const signUpWithUsername = useCallback(
    async (username: string, password: string, gender: 'male' | 'female', photoUri: string | null): Promise<void> => {
      try {
        // Import username utilities
        const { usernameToEmail } = await import('@/lib/username');
        
        // Convert username to internal email
        const cleanUsername = username.startsWith('@') ? username.slice(1).toLowerCase() : username.toLowerCase();
        const email = usernameToEmail(cleanUsername);
        const displayName = cleanUsername; // Store without "@"

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user: firebaseUser } = userCredential;

        // Update Firebase Auth profile
        await updateProfile(firebaseUser, { displayName, photoURL: photoUri });

        // Create complete user document in Firestore
        const userDocument: Partial<UserDocument> = {
          uid: firebaseUser.uid,
          username: cleanUsername,
          email,
          displayName,
          photoURL: photoUri || '',
          gender,
          ...(photoUri && { profilePictureUrl: photoUri }), // Only include if photo exists
          isVerified: false,
          status: 'approved', // No admin approval needed
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rankings: {
            singles: 1000,
            sameGenderDoubles: 1000,
            mixedDoubles: 1000,
          },
          matchStats: {
            totalMatches: 0,
            wins: 0,
            losses: 0,
          },
        };

        await setDoc(doc(firestore, 'users', firebaseUser.uid), userDocument);
      } catch (error) {
        console.error('Error signing up with username:', error);
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

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      const { signInWithGoogle: googleSignIn } = await import('@/lib/oauth');
      const oauthUserInfo = await googleSignIn();

      // Check if user document exists
      const userDoc = await getDoc(doc(firestore, 'users', oauthUserInfo.uid));

      if (!userDoc.exists()) {
        // Create incomplete user document for OAuth user
        // User will complete onboarding to set username and gender
        const newUserDocument: Partial<UserDocument> = {
          uid: oauthUserInfo.uid,
          email: oauthUserInfo.email || '',
          displayName: '', // Will be set from username during onboarding
          username: '', // Will be set during onboarding
          photoURL: oauthUserInfo.photoURL || '', // Keep OAuth photo as default
          isVerified: true, // OAuth users are verified
          status: 'incomplete', // User needs to complete onboarding
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rankings: {
            singles: 1000,
            sameGenderDoubles: 1000,
            mixedDoubles: 1000,
          },
          matchStats: {
            totalMatches: 0,
            wins: 0,
            losses: 0,
          },
        };

        await setDoc(doc(firestore, 'users', oauthUserInfo.uid), newUserDocument);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }, []);

  // Sign in with Apple OAuth
  const signInWithApple = useCallback(async (): Promise<void> => {
    try {
      const { signInWithApple: appleSignIn } = await import('@/lib/oauth');
      const oauthUserInfo = await appleSignIn();

      // Check if user document exists
      const userDoc = await getDoc(doc(firestore, 'users', oauthUserInfo.uid));

      if (!userDoc.exists()) {
        // Create incomplete user document for OAuth user
        // User will complete onboarding to set username and gender
        const newUserDocument: Partial<UserDocument> = {
          uid: oauthUserInfo.uid,
          email: oauthUserInfo.email || '',
          displayName: '', // Will be set from username during onboarding
          username: '', // Will be set during onboarding
          photoURL: oauthUserInfo.photoURL || '', // Keep OAuth photo as default
          isVerified: true, // OAuth users are verified
          status: 'incomplete', // User needs to complete onboarding
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rankings: {
            singles: 1000,
            sameGenderDoubles: 1000,
            mixedDoubles: 1000,
          },
          matchStats: {
            totalMatches: 0,
            wins: 0,
            losses: 0,
          },
        };

        await setDoc(doc(firestore, 'users', oauthUserInfo.uid), newUserDocument);
      }
    } catch (error) {
      console.error('Error signing in with Apple:', error);
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
    userDocument,
    firebaseUser,
    loading,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signUp,
    signUpWithUsername,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
