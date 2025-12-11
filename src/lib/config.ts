/**
 * App Configuration
 * Dynamic configuration that adapts to development and production environments
 */

import Constants from 'expo-constants';

interface AppConfig {
  webUrl: string;
  deepLinkScheme: string;
  appStoreUrl: string;
  playStoreUrl: string;
}

/**
 * Get the web URL dynamically based on environment
 * - Development: localhost with Vite dev server
 * - Production: Firebase Hosting URL or custom configured URL
 */
const getWebUrl = (): string => {
  if (__DEV__) {
    // Development: Use localhost
    return 'http://localhost:5173';
  }

  // Production: Use configured URL or default to Firebase Hosting
  return (
    Constants.expoConfig?.extra?.webUrl ||
    'https://picklebean-ranking-app.web.app'
  );
};

export const config: AppConfig = {
  webUrl: getWebUrl(),
  deepLinkScheme: 'picklebean',
  appStoreUrl: 'https://apps.apple.com/app/picklebean', // Update when published
  playStoreUrl:
    'https://play.google.com/store/apps/details?id=com.picklebean.app', // Update when published
};

/**
 * Generate a shareable lobby URL
 * @param roomCode - The lobby room code
 * @returns Full URL to the lobby page
 */
export const getLobbyUrl = (roomCode: string): string => {
  return `${config.webUrl}/lobby/${roomCode}`;
};

/**
 * Generate a deep link URL
 * @param path - Path after scheme (e.g., 'lobby/ABCD')
 * @returns Deep link URL
 */
export const getDeepLink = (path: string): string => {
  return `${config.deepLinkScheme}://${path}`;
};
