/**
 * Session Service - V1
 * 
 * Firestore operations for sessions.
 * Sessions are lightweight intent signals, not event management tools.
 * 
 * Operations:
 * - createSession: Create a new session at a court
 * - joinSession: Add user to session participants
 * - leaveSession: Remove user from session participants
 * - getSessionAtCourt: Get active/upcoming session at a court
 */

import {
  doc,
  collection,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { 
  Session, 
  SessionDuration, 
  SessionStatus,
  CreateSessionInput,
} from '@/types/session';

// =============================================================================
// COLLECTION REFERENCE
// =============================================================================

const SESSIONS_COLLECTION = 'sessions';

const sessionsRef = () => collection(firestore, SESSIONS_COLLECTION);
const sessionDocRef = (sessionId: string) => doc(firestore, SESSIONS_COLLECTION, sessionId);

// =============================================================================
// CREATE SESSION
// =============================================================================

interface CreateSessionParams {
  courtId: string;
  courtName: string;
  creatorId: string;
  creatorAvatar?: string;
  startTime: Date;
  duration: SessionDuration;
}

/**
 * Create a new session at a court
 * 
 * @returns The created session ID
 */
export const createSession = async ({
  courtId,
  courtName,
  creatorId,
  creatorAvatar,
  startTime,
  duration,
}: CreateSessionParams): Promise<string> => {
  // Generate session ID
  const sessionRef = doc(sessionsRef());
  const sessionId = sessionRef.id;
  
  // Calculate end time
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  // Determine initial status
  const now = new Date();
  const status: SessionStatus = now >= startTime ? 'active' : 'upcoming';
  
  // Build session document
  const sessionData: Omit<Session, 'id'> = {
    courtId,
    courtName,
    creatorId,
    creatorAvatar,
    startTime: Timestamp.fromDate(startTime),
    duration,
    endTime: Timestamp.fromDate(endTime),
    status,
    participantIds: [creatorId],
    participantAvatars: creatorAvatar ? [creatorAvatar] : [],
    createdAt: serverTimestamp() as Timestamp,
  };
  
  await setDoc(sessionRef, {
    id: sessionId,
    ...sessionData,
  });
  
  return sessionId;
};

// =============================================================================
// JOIN SESSION
// =============================================================================

interface JoinSessionParams {
  sessionId: string;
  userId: string;
  userAvatar?: string;
}

/**
 * Add user to session participants
 */
export const joinSession = async ({
  sessionId,
  userId,
  userAvatar,
}: JoinSessionParams): Promise<void> => {
  const sessionRef = sessionDocRef(sessionId);
  
  const updates: Record<string, unknown> = {
    participantIds: arrayUnion(userId),
  };
  
  // Only add avatar if provided (keep max 3 for display)
  if (userAvatar) {
    updates.participantAvatars = arrayUnion(userAvatar);
  }
  
  await updateDoc(sessionRef, updates);
};

// =============================================================================
// LEAVE SESSION
// =============================================================================

interface LeaveSessionParams {
  sessionId: string;
  userId: string;
  userAvatar?: string;
}

/**
 * Remove user from session participants
 * Note: If creator leaves, session continues until end time
 */
export const leaveSession = async ({
  sessionId,
  userId,
  userAvatar,
}: LeaveSessionParams): Promise<void> => {
  const sessionRef = sessionDocRef(sessionId);
  
  const updates: Record<string, unknown> = {
    participantIds: arrayRemove(userId),
  };
  
  if (userAvatar) {
    updates.participantAvatars = arrayRemove(userAvatar);
  }
  
  await updateDoc(sessionRef, updates);
};

// =============================================================================
// GET SESSION AT COURT
// =============================================================================

/**
 * Get the active or upcoming session at a court
 * 
 * @returns Session or null if none exists
 */
export const getSessionAtCourt = async (courtId: string): Promise<Session | null> => {
  const now = new Date();
  
  // Query for sessions at this court that haven't ended
  const q = query(
    sessionsRef(),
    where('courtId', '==', courtId),
    where('status', 'in', ['upcoming', 'active']),
    orderBy('startTime', 'asc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Session;
};

// =============================================================================
// GET SESSION BY ID
// =============================================================================

/**
 * Get a session by its ID
 */
export const getSessionById = async (sessionId: string): Promise<Session | null> => {
  const sessionRef = sessionDocRef(sessionId);
  const snapshot = await getDoc(sessionRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return { id: snapshot.id, ...snapshot.data() } as Session;
};

// =============================================================================
// CHECK IF USER IS PARTICIPANT
// =============================================================================

/**
 * Check if a user is a participant in a session
 */
export const isUserInSession = async (
  sessionId: string, 
  userId: string
): Promise<boolean> => {
  const session = await getSessionById(sessionId);
  
  if (!session) {
    return false;
  }
  
  return session.participantIds.includes(userId);
};

// =============================================================================
// UPDATE SESSION STATUS (For scheduled jobs/cleanup)
// =============================================================================

/**
 * Update session status based on current time
 * This would typically be called by a Cloud Function
 */
export const updateSessionStatus = async (sessionId: string): Promise<void> => {
  const session = await getSessionById(sessionId);
  
  if (!session) {
    return;
  }
  
  const now = new Date();
  const startTime = session.startTime.toDate();
  const endTime = session.endTime.toDate();
  
  let newStatus: SessionStatus | null = null;
  
  if (now >= endTime) {
    newStatus = 'ended';
  } else if (now >= startTime && session.status === 'upcoming') {
    newStatus = 'active';
  }
  
  if (newStatus && newStatus !== session.status) {
    await updateDoc(sessionDocRef(sessionId), {
      status: newStatus,
    });
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export const sessionService = {
  createSession,
  joinSession,
  leaveSession,
  getSessionAtCourt,
  getSessionById,
  isUserInSession,
  updateSessionStatus,
};

export default sessionService;
