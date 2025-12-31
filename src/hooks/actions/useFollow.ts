import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { followService } from '@/services/followService';

interface UseFollowReturn {
  isFollowing: boolean;
  loading: boolean;
  error: string | null;
  toggleFollow: () => Promise<void>;
}

/**
 * Hook to manage follow/unfollow state for a specific user
 * @param targetUserId - The user ID to follow/unfollow
 */
export const useFollow = (targetUserId: string): UseFollowReturn => {
  const { userDocument } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if currently following
  const isFollowing = useMemo(() => {
    if (!userDocument?.following || !targetUserId) return false;
    return userDocument.following.includes(targetUserId);
  }, [userDocument?.following, targetUserId]);

  // Toggle follow status
  const toggleFollow = useCallback(async () => {
    if (!userDocument?.uid || !targetUserId) {
      setError('User not authenticated');
      return;
    }

    if (userDocument.uid === targetUserId) {
      setError('Cannot follow yourself');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await followService.toggleFollow(
        userDocument.uid,
        targetUserId,
        isFollowing
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update follow status';
      setError(errorMessage);
      console.error('Error toggling follow:', err);
    } finally {
      setLoading(false);
    }
  }, [userDocument?.uid, targetUserId, isFollowing]);

  return {
    isFollowing,
    loading,
    error,
    toggleFollow,
  };
};
