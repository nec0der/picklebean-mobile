import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/config/firebase';

export interface FollowUser {
  uid: string;
  displayName: string;
  username: string;
  profilePictureUrl?: string;
  isFollowing: boolean; // Whether current user follows this user
}

/**
 * Hook to fetch list of users that the given user is following
 */
export const useFollowing = (userId: string, currentUserId?: string) => {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchFollowing = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the user document to access following array
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        
        if (!userDoc.exists()) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const followingIds = userDoc.data()?.following || [];
        
        if (followingIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch full user data for each following ID
        const usersQuery = query(
          collection(firestore, 'users'),
          where('__name__', 'in', followingIds.slice(0, 10)) // Firestore 'in' limit is 10
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        
        // Get current user's following list to check isFollowing status
        let currentUserFollowing: string[] = [];
        if (currentUserId) {
          const currentUserDoc = await getDoc(doc(firestore, 'users', currentUserId));
          currentUserFollowing = currentUserDoc.data()?.following || [];
        }
        
        const usersList: FollowUser[] = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          displayName: doc.data().displayName || 'User',
          username: doc.data().username || doc.id,
          profilePictureUrl: doc.data().profilePictureUrl || doc.data().photoURL,
          isFollowing: currentUserFollowing.includes(doc.id),
        }));
        
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching following:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId, currentUserId]);

  return { users, loading, error };
};

/**
 * Hook to fetch list of users that follow the given user
 */
export const useFollowers = (userId: string, currentUserId?: string) => {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchFollowers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the user document to access followers array
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        
        if (!userDoc.exists()) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const followersIds = userDoc.data()?.followers || [];
        
        if (followersIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch full user data for each follower ID
        const usersQuery = query(
          collection(firestore, 'users'),
          where('__name__', 'in', followersIds.slice(0, 10)) // Firestore 'in' limit is 10
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        
        // Get current user's following list to check isFollowing status
        let currentUserFollowing: string[] = [];
        if (currentUserId) {
          const currentUserDoc = await getDoc(doc(firestore, 'users', currentUserId));
          currentUserFollowing = currentUserDoc.data()?.following || [];
        }
        
        const usersList: FollowUser[] = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          displayName: doc.data().displayName || 'User',
          username: doc.data().username || doc.id,
          profilePictureUrl: doc.data().profilePictureUrl || doc.data().photoURL,
          isFollowing: currentUserFollowing.includes(doc.id),
        }));
        
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching followers:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId, currentUserId]);

  return { users, loading, error };
};
