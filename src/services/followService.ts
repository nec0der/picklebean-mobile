import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';

/**
 * Follow Service
 * Handles following/unfollowing users with denormalized counts
 */

export const followService = {
  /**
   * Follow a user
   * Updates both follower's following list and followee's followers list
   */
  followUser: async (followerId: string, followingId: string): Promise<void> => {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    try {
      // Update follower's document (add to following array)
      const followerRef = doc(firestore, 'users', followerId);
      await updateDoc(followerRef, {
        following: arrayUnion(followingId),
        followingCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      // Update followee's document (add to followers array)
      const followingRef = doc(firestore, 'users', followingId);
      await updateDoc(followingRef, {
        followers: arrayUnion(followerId),
        followersCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error following user:', error);
      throw new Error('Failed to follow user');
    }
  },

  /**
   * Unfollow a user
   * Removes from both follower's following list and followee's followers list
   */
  unfollowUser: async (followerId: string, followingId: string): Promise<void> => {
    try {
      // Update follower's document (remove from following array)
      const followerRef = doc(firestore, 'users', followerId);
      await updateDoc(followerRef, {
        following: arrayRemove(followingId),
        followingCount: increment(-1),
        updatedAt: serverTimestamp(),
      });

      // Update followee's document (remove from followers array)
      const followingRef = doc(firestore, 'users', followingId);
      await updateDoc(followingRef, {
        followers: arrayRemove(followerId),
        followersCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw new Error('Failed to unfollow user');
    }
  },

  /**
   * Toggle follow status
   * Convenience method to follow or unfollow based on current status
   */
  toggleFollow: async (
    followerId: string,
    followingId: string,
    isCurrentlyFollowing: boolean
  ): Promise<void> => {
    if (isCurrentlyFollowing) {
      await followService.unfollowUser(followerId, followingId);
    } else {
      await followService.followUser(followerId, followingId);
    }
  },
};
