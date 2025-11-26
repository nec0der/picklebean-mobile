import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '@/config/firebase';

const USERNAME_DOMAIN = '@picklebean.app';

/**
 * Validates username format
 * - Must be 3-20 characters
 * - Alphanumeric and underscore only
 * - Cannot start with underscore
 * - Case insensitive
 */
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  // Remove @ if present
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

  // Allow any length from 1-20 characters
  if (cleanUsername.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }

  if (cleanUsername.startsWith('_')) {
    return { valid: false, error: 'Username cannot start with underscore' };
  }

  // Check for valid characters (alphanumeric and underscore only)
  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(cleanUsername)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
};


/**
 * Convert username to internal email for Firebase Auth
 * @johndoe → johndoe@picklebean.app
 */
export const usernameToEmail = (username: string): string => {
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  return `${cleanUsername.toLowerCase()}${USERNAME_DOMAIN}`;
};

/**
 * Extract username from internal email
 * johndoe@picklebean.app → johndoe
 */
export const emailToUsername = (email: string): string | null => {
  if (email.endsWith(USERNAME_DOMAIN)) {
    return email.replace(USERNAME_DOMAIN, '');
  }
  return null;
};

/**
 * Format username for display (always with @)
 */
export const formatUsername = (username: string): string => {
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  return `@${cleanUsername}`;
};

/**
 * Check if a string is a username or email
 */
export const isUsername = (input: string): boolean => {
  return input.startsWith('@') || !input.includes('@');
};

/**
 * Check if username is available in Firestore
 * @param username - Username to check
 * @returns Object with availability status and optional error message
 */
export const checkUsernameAvailability = async (
  username: string
): Promise<{ available: boolean; error?: string }> => {
  try {
    const cleanUsername = username.toLowerCase();
    
    // Query users collection where username field matches
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', cleanUsername));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { available: false, error: 'Username is already taken' };
    }
    
    return { available: true };
  } catch (error) {
    console.error('Error checking username availability:', error);
    return { available: false, error: 'Failed to check availability' };
  }
};
