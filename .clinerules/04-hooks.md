# Custom Hooks Patterns

## Hook Basics

### Naming Convention

All hooks **must** start with `use`:

```typescript
// ✅ CORRECT
useAuth()
useUser()
useLobby()
useDebounce()

// ❌ INCORRECT
getAuth()
fetchUser()
lobby()
```

---

## Hook Structure

### Standard Hook Pattern

```typescript
// /src/hooks/firestore/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { User } from '@/types/user';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useUser = (userId: string): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(firestore, 'users', userId),
      (snapshot) => {
        if (snapshot.exists()) {
          setUser({ id: snapshot.id, ...snapshot.data() } as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  return { user, loading, error, refetch };
};
```

---

## Hook Organization

```
/src/hooks/
├── auth/
│   ├── useAuth.ts              # Access AuthContext
│   ├── useCurrentUser.ts       # Current user data
│   ├── useAuthActions.ts       # Login, logout, etc.
│   └── useAuthState.ts         # Auth state helpers
├── firestore/
│   ├── useUser.ts              # Single user query
│   ├── useUsers.ts             # Multiple users
│   ├── useUserMatches.ts       # User's match history
│   └── useLeaderboard.ts       # Leaderboard data
├── lobby/
│   ├── useLobby.ts             # Single lobby
│   ├── useLobbyActions.ts      # Create, join, leave
│   └── useLobbyPlayers.ts      # Players in lobby
├── game/
│   ├── useGame.ts              # Game state
│   ├── useGameTimer.ts         # Game timer
│   └── useGameActions.ts       # Score updates, etc.
└── common/
    ├── useDebounce.ts          # Debounce values
    ├── useKeyboard.ts          # Keyboard visibility
    ├── useAsync.ts             # Async operations
    └── usePrevious.ts          # Previous value tracking
```

---

## Context Consumption Hooks

```typescript
// /src/hooks/auth/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

// Usage in components
const { user, loading, signIn, signOut } = useAuth();
```

---

## Firestore Hooks Pattern

### Single Document Hook

```typescript
// /src/hooks/firestore/useLobby.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { Lobby } from '@/types/lobby';

interface UseLobbyReturn {
  lobby: Lobby | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
}

export const useLobby = (roomCode: string): UseLobbyReturn => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(firestore, 'lobbies', roomCode),
      (snapshot) => {
        setExists(snapshot.exists());
        if (snapshot.exists()) {
          setLobby({ id: snapshot.id, ...snapshot.data() } as Lobby);
        } else {
          setLobby(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  return { lobby, loading, error, exists };
};
```

### Collection Hook

```typescript
// /src/hooks/firestore/useUserMatches.ts
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import type { Match } from '@/types/game';

interface UseUserMatchesReturn {
  matches: Match[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
}

export const useUserMatches = (userId: string, limitCount = 20): UseUserMatchesReturn => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const q = query(
      collection(firestore, 'matches'),
      where('playerIds', 'array-contains', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount + 1)  // Fetch one extra to check if there are more
    );

  const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const matchList = snapshot.docs.slice(0, limitCount).map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Match[];
        
        setMatches(matchList);
        setHasMore(snapshot.docs.length > limitCount);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, limitCount]);

  return { matches, loading, error, hasMore };
};
```

---

## Action Hooks Pattern

```typescript
// /src/hooks/lobby/useLobbyActions.ts
import { useCallback } from 'react';
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { generateRoomCode } from '@/lib/roomCode';
import type { Lobby } from '@/types/lobby';

interface UseLobbyActionsReturn {
  createLobby: (hostId: string, settings: LobbySettings) => Promise<string>;
  joinLobby: (roomCode: string, userId: string) => Promise<void>;
  leaveLobby: (roomCode: string, userId: string) => Promise<void>;
  deleteLobby: (roomCode: string) => Promise<void>;
}

export const useLobbyActions = (): UseLobbyActionsReturn => {
  const createLobby = useCallback(async (
    hostId: string,
    settings: LobbySettings
  ): Promise<string> => {
    const roomCode = generateRoomCode();
    
    const lobbyData: Lobby = {
      roomCode,
      hostId,
      playerIds: [hostId],
      settings,
      status: 'waiting',
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(firestore, 'lobbies', roomCode), lobbyData);
    
    return roomCode;
  }, []);

  const joinLobby = useCallback(async (
    roomCode: string,
    userId: string
  ): Promise<void> => {
    const lobbyRef = doc(firestore, 'lobbies', roomCode);
    
    await updateDoc(lobbyRef, {
      playerIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  }, []);

  const leaveLobby = useCallback(async (
    roomCode: string,
    userId: string
  ): Promise<void> => {
    const lobbyRef = doc(firestore, 'lobbies', roomCode);
    
    await updateDoc(lobbyRef, {
      playerIds: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deleteLobby = useCallback(async (roomCode: string): Promise<void> => {
    await deleteDoc(doc(firestore, 'lobbies', roomCode));
  }, []);

  return { createLobby, joinLobby, leaveLobby, deleteLobby };
};
```

---

## Utility Hooks

### Debounce Hook

```typescript
// /src/hooks/common/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchUsers(debouncedSearch);
  }
}, [debouncedSearch]);
```

### Keyboard Hook

```typescript
// /src/hooks/common/useKeyboard.ts
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

interface UseKeyboardReturn {
  keyboardVisible: boolean;
  keyboardHeight: number;
}

export const useKeyboard = (): UseKeyboardReturn => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      (e: KeyboardEvent) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { keyboardVisible, keyboardHeight };
};
```

### Async Hook

```typescript
// /src/hooks/common/useAsync.ts
import { useState, useEffect, useCallback } from 'react';

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
}

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
};
```

---

## Hook Best Practices

### 1. Return Objects, Not Arrays

```typescript
// ✅ CORRECT: Return object (easier to extend)
const { user, loading, error, refetch } = useUser(userId);

// ❌ AVOID: Return array (harder to extend, order matters)
const [user, loading, error] = useUser(userId);
```

### 2. Always Type Return Values

```typescript
// ✅ CORRECT: Explicit return type
interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useUser = (userId: string): UseUserReturn => {
  // Implementation
};
```

### 3. Handle Cleanup

```typescript
// ✅ CORRECT: Cleanup Firebase listeners
useEffect(() => {
  const unsubscribe = onSnapshot(/* ... */);
  return () => unsubscribe();
}, []);

// ✅ CORRECT: Cleanup timers
useEffect(() => {
  const timer = setTimeout(/* ... */);
  return () => clearTimeout(timer);
}, []);
```

### 4. Optimize Dependencies

```typescript
// ✅ CORRECT: Memoize callback to prevent unnecessary re-runs
const fetchData = useCallback(async () => {
  // Fetch logic
}, [dependency]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 5. Single Responsibility

Each hook should do one thing well. Break complex hooks into smaller ones.

```typescript
// ✅ CORRECT: Focused hooks
const { user } = useUser(userId);
const { matches } = useUserMatches(userId);

// ❌ AVOID: Kitchen sink hook
const { user, matches, ratings, achievements } = useUserEverything(userId);
