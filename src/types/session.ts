/**
 * Session Types - V1 LOCKED CONTRACT
 * 
 * Sessions are lightweight intent signals, not event management tools.
 * 
 * Core Principle:
 * "I (or we) plan to play at this court around this time."
 * 
 * V1 Hard NOs:
 * ❌ No chat
 * ❌ No invites
 * ❌ No limits
 * ❌ No skill filtering
 * ❌ No notifications
 * ❌ No editing after creation
 * ❌ No ownership transfer
 */

import type { Timestamp } from 'firebase/firestore';

// =============================================================================
// SESSION DURATION (Presets Only)
// =============================================================================

export const SESSION_DURATIONS = [60, 90, 120] as const;
export type SessionDuration = typeof SESSION_DURATIONS[number];

export const DURATION_LABELS: Record<SessionDuration, string> = {
  60: '1 hour',
  90: '1.5 hours',
  120: '2 hours',
} as const;

// =============================================================================
// SESSION STATUS (Auto-managed)
// =============================================================================

export const SESSION_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  ENDED: 'ended',
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

// =============================================================================
// SESSION DOCUMENT
// =============================================================================

export interface Session {
  id: string;
  
  // Court reference (V1: one session per court at a time)
  courtId: string;
  courtName: string; // Denormalized for display
  
  // Creator
  creatorId: string;
  creatorAvatar?: string;
  
  // Time
  startTime: Timestamp;
  duration: SessionDuration; // Minutes
  endTime: Timestamp;        // Computed: startTime + duration
  
  // Status (auto-managed by lifecycle)
  status: SessionStatus;
  
  // Participants (including creator)
  participantIds: string[];
  participantAvatars: string[]; // Denormalized for map display (max 3)
  
  // Metadata
  createdAt: Timestamp;
}

// =============================================================================
// CREATE SESSION INPUT
// =============================================================================

export interface CreateSessionInput {
  courtId: string;
  courtName: string;
  startTime: Date;
  duration: SessionDuration;
}

// =============================================================================
// SESSION STATE FOR UI
// =============================================================================

export interface SessionState {
  session: Session | null;
  isCreator: boolean;
  isParticipant: boolean;
  canJoin: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get display text for session status
 */
export const getSessionStatusText = (status: SessionStatus): string => {
  switch (status) {
    case 'active':
      return 'Session happening';
    case 'upcoming':
      return 'Session planned';
    case 'ended':
      return 'Session ended';
  }
};

/**
 * Calculate session status based on current time
 */
export const calculateSessionStatus = (
  startTime: Date,
  endTime: Date,
  now: Date = new Date()
): SessionStatus => {
  if (now < startTime) return 'upcoming';
  if (now >= startTime && now < endTime) return 'active';
  return 'ended';
};

/**
 * Get next 30-minute time slot
 */
export const getNextTimeSlot = (): Date => {
  const now = new Date();
  const minutes = now.getMinutes();
  
  if (minutes < 30) {
    now.setMinutes(30, 0, 0);
  } else {
    now.setHours(now.getHours() + 1, 0, 0, 0);
  }
  
  return now;
};

/**
 * Check if user can create session at court
 * (V1: one active/upcoming session per court)
 */
export const canCreateSessionAtCourt = (
  existingSession: Session | null
): boolean => {
  if (!existingSession) return true;
  return existingSession.status === 'ended';
};
