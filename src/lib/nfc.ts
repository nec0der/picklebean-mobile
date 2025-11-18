/**
 * Extract user ID from NFC profile URL
 * @param url - Profile URL from NFC tag (e.g., "https://picklebean.com/profile/user123")
 * @returns User ID or null if invalid format
 */
export const extractUserIdFromNFCUrl = (url: string): string | null => {
  try {
    // Match pattern: /profile/{userId} at the end of URL
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
