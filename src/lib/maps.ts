/**
 * Native Maps Integration
 * Opens Apple Maps (iOS) or Google Maps (Android)
 */

import { Linking, Platform } from 'react-native';

interface Location {
  latitude?: number;
  longitude?: number;
  address?: string;
  name?: string;
}

export const openMaps = async (location: Location): Promise<void> => {
  const { latitude, longitude, address, name } = location;

  // Prefer lat/lng, fallback to address
  if (latitude && longitude) {
    const label = encodeURIComponent(name || 'Location');
    const coords = `${latitude},${longitude}`;

    const url = Platform.select({
      ios: `maps://?daddr=${coords}`,
      android: `geo:0,0?q=${coords}(${label})`,
    });

    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    }
  } else if (address) {
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps://?daddr=${query}`,
      android: `geo:0,0?q=${query}`,
    });

    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    }
  }
};
