import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { UserDocument } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

interface UsePublicProfileReturn {
  user: UserDocument | null;
  loading: boolean;
  error: Error | null;
  isPrivate: boolean;
  isOwn: boolean;
}

/**
 * Hook to fetch a user's public profile by username
 * Respects privacy settings - returns null if profile is private and viewer is not the owner
 */
export const usePublicProfile = (username: string): UsePublicProfileReturn => {
  const { userDocument: currentUser } = useAuth();
  const [user, setUser] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query by username field
    const q = query(
      collection(firestore, 'users'),
      where('username', '==', username.toLowerCase()),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const userData = { uid: doc.id, ...doc.data() } as UserDocument;
          
          // Check privacy settings
          const profileVisibility = userData.profileVisibility || 'public';
          const isProfilePrivate = profileVisibility === 'private';
          
          setIsPrivate(isProfilePrivate);
          
          // Allow viewing if:
          // 1. Profile is public
          // 2. Viewer is the profile owner
          if (!isProfilePrivate || isOwn) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
          setError(new Error('User not found'));
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user profile:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [username, isOwn]);

  return { user, loading, error, isPrivate, isOwn };
};
