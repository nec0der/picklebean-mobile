/**
 * Court Hours Utilities
 * Helper functions for operating hours and status
 */

import type { Court } from '@/types/court';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Get current day of week as lowercase string
 */
export const getCurrentDay = (): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

/**
 * Get today's operating hours
 */
export const getTodayHours = (court: Court): { open: string; close: string } => {
  const today = getCurrentDay();
  return court.operatingHours[today];
};

/**
 * Format time from "HH:MM" to "H:MM AM/PM"
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Check if court is currently open
 */
export const isCourtOpen = (court: Court): boolean => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const todayHours = getTodayHours(court);
  
  return currentTime >= todayHours.open && currentTime < todayHours.close;
};

/**
 * Get status text for court
 */
export const getCourtStatus = (court: Court): { text: string; color: string } => {
  if (isCourtOpen(court)) {
    const todayHours = getTodayHours(court);
    return {
      text: `Open until ${formatTime(todayHours.close)}`,
      color: '#10b981', // green
    };
  }
  
  return {
    text: 'Closed',
    color: '#6b7280', // gray
  };
};

/**
 * Get lighting status text
 */
export const getLightingStatus = (court: Court): string | null => {
  if (!court.lighting.available) return null;
  
  if (court.lighting.autoOffTime) {
    return `Lights until ${formatTime(court.lighting.autoOffTime)}`;
  }
  
  return 'Lighting available';
};

/**
 * Check if "Play" button should be disabled
 */
export const shouldDisablePlay = (court: Court): { disabled: boolean; reason?: string } => {
  // Check if court is closed
  if (!isCourtOpen(court)) {
    const todayHours = getTodayHours(court);
    return {
      disabled: true,
      reason: `Closed • Opens at ${formatTime(todayHours.open)}`,
    };
  }
  
  // Check if lights are needed and unavailable (after 8 PM assumption)
  const now = new Date();
  const isEvening = now.getHours() >= 20; // 8 PM or later
  
  if (isEvening && !court.lighting.available) {
    return {
      disabled: true,
      reason: 'No lighting available',
    };
  }
  
  return { disabled: false };
};

/**
 * Format access type for display
 */
export const formatAccessType = (accessType: string): string => {
  const map: Record<string, string> = {
    PUBLIC: 'Public court',
    FREE_WITH_MEMBERSHIP: 'Free with membership',
    FEE_PER_SESSION: 'Fee per session',
    FEE_WITH_MEMBERSHIP: 'Membership + session fee',
    PRIVATE: 'Private access',
    SCHOOL_ONLY: 'School members only',
    HOTEL_GUEST_ONLY: 'Hotel guests only',
  };
  
  return map[accessType] || accessType;
};

/**
 * Format fees for display
 */
export const formatFees = (access: Court['access']): string | null => {
  const parts: string[] = [];
  
  if (access.sessionFee) {
    parts.push(`$${access.sessionFee} per session`);
  }
  
  if (access.membershipFee) {
    parts.push(`$${access.membershipFee}/year membership`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : null;
};
