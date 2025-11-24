/**
 * Firebase Auth Error Message Mapper
 * Converts technical Firebase error codes into user-friendly messages
 */

interface FirebaseError {
  code?: string;
  message?: string;
}

/**
 * Get user-friendly error message from Firebase auth error
 * @param error - Firebase error object
 * @returns User-friendly error message
 */
export const getAuthErrorMessage = (error: FirebaseError): string => {
  const code = error.code || '';

  switch (code) {
    // Sign Up Errors
    case 'auth/email-already-in-use':
      return 'This username is already taken. Please choose a different username.';

    case 'auth/invalid-email':
      return 'Please enter a valid email address.';

    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';

    case 'auth/operation-not-allowed':
      return 'Email sign-up is currently disabled. Please contact support.';

    // Sign In Errors
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';

    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';

    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check and try again.';

    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';

    // Network & General Errors
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';

    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again in a few minutes.';

    case 'auth/timeout':
      return 'Request timed out. Please try again.';

    // Permission Errors (Development/Configuration)
    case 'permission-denied':
    case 'auth/insufficient-permission':
    case 'auth/missing-permissions':
      return 'Authentication not configured properly. Please contact support.';

    // Firestore Errors
    case 'firestore/permission-denied':
      return 'Permission denied. Please check your account settings.';

    case 'firestore/unavailable':
      return 'Service temporarily unavailable. Please try again.';

    // Default fallback
    default:
      // Return original message if it's user-friendly
      if (error.message && !error.message.includes('auth/')) {
        return error.message;
      }
      return 'An error occurred. Please try again or contact support.';
  }
};

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get password strength and feedback
 * @param password - Password to check
 * @returns Object with strength level and feedback message
 */
export const getPasswordStrength = (
  password: string
): { strength: 'weak' | 'medium' | 'strong'; message: string } => {
  if (password.length < 6) {
    return {
      strength: 'weak',
      message: 'Password must be at least 6 characters',
    };
  }

  if (password.length < 8) {
    return {
      strength: 'weak',
      message: 'Password is weak. Use 8+ characters for better security',
    };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length >= 12 && hasLetter && hasNumber && hasSpecial) {
    return {
      strength: 'strong',
      message: 'Strong password',
    };
  }

  if (password.length >= 8 && ((hasLetter && hasNumber) || (hasLetter && hasSpecial))) {
    return {
      strength: 'medium',
      message: 'Good password. Consider adding special characters',
    };
  }

  return {
    strength: 'weak',
    message: 'Use letters, numbers, and special characters',
  };
};
