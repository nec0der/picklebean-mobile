import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/config/firebase';

/**
 * Extract username from NFC profile URL
 * @param url - Profile URL from NFC tag (e.g., "https://picklebean.com/profile/username")
 * @returns Username or null if invalid format
 */
export const extractUsernameFromNFCUrl = (url: string): string | null => {
  try {
    // Match pattern: /profile/{username} at the end of URL
    const pattern = /\/profile\/([^/?#]+)(?:[?#].*)?$/;
    const match = url.match(pattern);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing NFC URL:', error);
    return null;
  }
};

/**
 * Get user ID from username by querying Firestore
 * @param username - Username to look up
 * @returns User ID (UID) or null if not found
 */
export const getUserIdFromUsername = async (username: string): Promise<string | null> => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first matching user's document ID (UID)
    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error('Error looking up user by username:', error);
    return null;
  }
};

/**
 * LEGACY: Extract user ID from NFC profile URL
 * @deprecated Use extractUsernameFromNFCUrl + getUserIdFromUsername instead
 * @param url - Profile URL from NFC tag
 * @returns Username (not userId) or null if invalid format
 */
export const extractUserIdFromNFCUrl = extractUsernameFromNFCUrl;

/**
 * Validate if URL is a profile URL
 * @param url - URL to validate
 * @returns true if valid profile URL format
 */
export const isValidProfileUrl = (url: string): boolean => {
  try {
    return /\/profile\/[^/?#]+/.test(url);
  } catch {
    return false;
  }
};
