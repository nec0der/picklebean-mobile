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

  if (cleanUsername.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

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
