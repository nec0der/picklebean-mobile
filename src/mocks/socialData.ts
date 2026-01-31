/**
 * Mock data for Social Mode
 * 
 * Shows followed users who are currently checked-in at courts
 * Users are grouped by court for the cluster pin display
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FollowedUser {
  id: string;
  displayName: string;
  username: string;
  photoURL: string;
}

export interface CheckedInUser extends FollowedUser {
  courtId: string;
  courtName: string;
  latitude: number;
  longitude: number;
  checkedInAt: string; // ISO timestamp
}

/** Grouped users at a single court location */
export interface CourtCluster {
  courtId: string;
  courtName: string;
  latitude: number;
  longitude: number;
  users: CheckedInUser[];
}

// =============================================================================
// MOCK FOLLOWED USERS (people you follow)
// =============================================================================

export const MOCK_FOLLOWED_USERS: FollowedUser[] = [
  {
    id: 'user-sarah',
    displayName: 'Sarah Chen',
    username: 'sarahchen',
    photoURL: 'https://i.pravatar.cc/150?u=sarah-chen',
  },
  {
    id: 'user-mike',
    displayName: 'Mike Rodriguez',
    username: 'mikerod',
    photoURL: 'https://i.pravatar.cc/150?u=mike-rodriguez',
  },
  {
    id: 'user-emma',
    displayName: 'Emma Wilson',
    username: 'emmaw',
    photoURL: 'https://i.pravatar.cc/150?u=emma-wilson',
  },
  {
    id: 'user-alex',
    displayName: 'Alex Kim',
    username: 'alexk',
    photoURL: 'https://i.pravatar.cc/150?u=alex-kim',
  },
  {
    id: 'user-jordan',
    displayName: 'Jordan Taylor',
    username: 'jtaylor',
    photoURL: 'https://i.pravatar.cc/150?u=jordan-taylor',
  },
  {
    id: 'user-lisa',
    displayName: 'Lisa Park',
    username: 'lisap',
    photoURL: 'https://i.pravatar.cc/150?u=lisa-park',
  },
  {
    id: 'user-david',
    displayName: 'David Chen',
    username: 'davidc',
    photoURL: 'https://i.pravatar.cc/150?u=david-chen',
  },
  {
    id: 'user-nina',
    displayName: 'Nina Patel',
    username: 'ninap',
    photoURL: 'https://i.pravatar.cc/150?u=nina-patel',
  },
  {
    id: 'user-tom',
    displayName: 'Tom Johnson',
    username: 'tomj',
    photoURL: 'https://i.pravatar.cc/150?u=tom-johnson',
  },
  {
    id: 'user-maya',
    displayName: 'Maya Singh',
    username: 'mayas',
    photoURL: 'https://i.pravatar.cc/150?u=maya-singh',
  },
];

// =============================================================================
// MOCK CHECK-INS (which followed users are at which courts)
// =============================================================================

export const MOCK_CHECKED_IN_USERS: CheckedInUser[] = [
  // === DEL WEBB SUN CITY (court-6) - Many users to test +N ===
  {
    id: 'user-sarah',
    displayName: 'Sarah Chen',
    username: 'sarahchen',
    photoURL: 'https://i.pravatar.cc/150?u=sarah-chen',
    courtId: 'court-6',
    courtName: 'Del Webb Sun City Courts',
    latitude: 42.1825,
    longitude: -88.4210,
    checkedInAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'user-mike',
    displayName: 'Mike Rodriguez',
    username: 'mikerod',
    photoURL: 'https://i.pravatar.cc/150?u=mike-rodriguez',
    courtId: 'court-6',
    courtName: 'Del Webb Sun City Courts',
    latitude: 42.1825,
    longitude: -88.4210,
    checkedInAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'user-lisa',
    displayName: 'Lisa Park',
    username: 'lisap',
    photoURL: 'https://i.pravatar.cc/150?u=lisa-park',
    courtId: 'court-6',
    courtName: 'Del Webb Sun City Courts',
    latitude: 42.1825,
    longitude: -88.4210,
    checkedInAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: 'user-david',
    displayName: 'David Chen',
    username: 'davidc',
    photoURL: 'https://i.pravatar.cc/150?u=david-chen',
    courtId: 'court-6',
    courtName: 'Del Webb Sun City Courts',
    latitude: 42.1825,
    longitude: -88.4210,
    checkedInAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'user-nina',
    displayName: 'Nina Patel',
    username: 'ninap',
    photoURL: 'https://i.pravatar.cc/150?u=nina-patel',
    courtId: 'court-6',
    courtName: 'Del Webb Sun City Courts',
    latitude: 42.1825,
    longitude: -88.4210,
    checkedInAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  
  // === SQUARE BARN (court-10) - 3 users ===
  {
    id: 'user-emma',
    displayName: 'Emma Wilson',
    username: 'emmaw',
    photoURL: 'https://i.pravatar.cc/150?u=emma-wilson',
    courtId: 'court-10',
    courtName: 'Square Barn Golf & Recreation',
    latitude: 42.1830,
    longitude: -88.3950,
    checkedInAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'user-tom',
    displayName: 'Tom Johnson',
    username: 'tomj',
    photoURL: 'https://i.pravatar.cc/150?u=tom-johnson',
    courtId: 'court-10',
    courtName: 'Square Barn Golf & Recreation',
    latitude: 42.1830,
    longitude: -88.3950,
    checkedInAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'user-maya',
    displayName: 'Maya Singh',
    username: 'mayas',
    photoURL: 'https://i.pravatar.cc/150?u=maya-singh',
    courtId: 'court-10',
    courtName: 'Square Barn Golf & Recreation',
    latitude: 42.1830,
    longitude: -88.3950,
    checkedInAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  
  // === LINCOLN PARK (court-3) - 1 user (single avatar, no count) ===
  {
    id: 'user-alex',
    displayName: 'Alex Kim',
    username: 'alexk',
    photoURL: 'https://i.pravatar.cc/150?u=alex-kim',
    courtId: 'court-3',
    courtName: 'Lincoln Park Courts',
    latitude: 41.9216,
    longitude: -87.6366,
    checkedInAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

// =============================================================================
// HELPER: Group check-ins by court for cluster display
// =============================================================================

export const groupUsersByCourt = (users: CheckedInUser[]): CourtCluster[] => {
  const courtMap = new Map<string, CourtCluster>();
  
  for (const user of users) {
    const existing = courtMap.get(user.courtId);
    
    if (existing) {
      existing.users.push(user);
    } else {
      courtMap.set(user.courtId, {
        courtId: user.courtId,
        courtName: user.courtName,
        latitude: user.latitude,
        longitude: user.longitude,
        users: [user],
      });
    }
  }
  
  return Array.from(courtMap.values());
};

/** Pre-computed court clusters for Social mode */
export const MOCK_COURT_CLUSTERS = groupUsersByCourt(MOCK_CHECKED_IN_USERS);
