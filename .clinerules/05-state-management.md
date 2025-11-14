# State Management with Context API

## Context Architecture

Use React Context API for global state management. No need for Redux/Zustand for this app size.

---

## Context Structure

```
/src/contexts/
├── AuthContext.tsx          # User authentication state
├── LobbyContext.tsx         # Active lobby state
├── GameContext.tsx          # Active game state
└── ThemeContext.tsx         # App theme/settings (optional)
```

---

## Context Pattern

### Standard Context Implementation

```typescript
// /src/contexts/AuthContext.tsx
import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback 
} from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/config/firebase';
import type { User } from '@/types/user';

// Context value interface
interface AuthContextValue {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

// Create context with undefined default
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Hook to consume context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

// Provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userData = await fetchUserData(firebaseUser.uid);
        setUser(userData);
        setFirebaseUser(firebaseUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Actions
  const signIn = useCallback(async (email: string, password: string) => {
    // Sign in logic
  }, []);

  const signOut = useCallback(async () => {
    await auth.signOut();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    // Update logic
  }, [user]);

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## State Management Rules

### 1. Local State First

Use `useState` for component-local state:

```typescript
// ✅ CORRECT: Local state for component-specific data
const [isExpanded, setIsExpanded] = useState(false);
const [searchText, setSearchText] = useState('');
```

### 2. Context for Global State

Use Context for data needed across multiple components:

```typescript
// ✅ CORRECT: Global state in context
const { user } = useAuth();  // Used in many components
const { lobby } = useLobby();  // Shared lobby state
```

### 3. Prop Drilling Threshold

If passing props through more than 2-3 levels, consider Context:

```typescript
// ❌ INCORRECT: Deep prop drilling
<Parent>
  <Child user={user}>
    <GrandChild user={user}>
      <GreatGrandChild user={user} />
    </GrandChild>
  </Child>
</Parent>

// ✅ CORRECT: Use context
<AuthProvider>
  <Parent>
    <Child>
      <GrandChild>
        <GreatGrandChild />  {/* Use useAuth() inside */}
      </GrandChild>
    </Child>
  </Parent>
</AuthProvider>
```

### 4. Immutable Updates

Never mutate state directly:

```typescript
// ❌ INCORRECT: Direct mutation
user.name = 'New Name';
setUser(user);

// ✅ CORRECT: Create new object
setUser({ ...user, name: 'New Name' });

// ❌ INCORRECT: Array mutation
players.push(newPlayer);
setPlayers(players);

// ✅ CORRECT: Create new array
setPlayers([...players, newPlayer]);
setPlayers(players.filter(p => p.id !== removeId));
```

---

## Performance Optimization

### Minimize Re-renders

```typescript
// ✅ CORRECT: Split context by update frequency
// Fast-changing data
const GameStateContext = createContext<GameState>();

// Slow-changing data
const GameActionsContext = createContext<GameActions>();

// Components only re-render when their context changes
const GameScore = () => {
  const { score } = useContext(GameStateContext);  // Re-renders on score change
  return <Text>{score}</Text>;
};

const GameControls = () => {
  const { updateScore } = useContext(GameActionsContext);  // Doesn't re-render on score change
  return <Button onPress={updateScore}>Update</Button>;
};
```

### Memoization

```typescript
// ✅ CORRECT: Memoize context value
const value = useMemo(
  () => ({
    user,
    loading,
    signIn,
    signOut,
  }),
  [user, loading, signIn, signOut]
);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

---

## Complex State Patterns

### Reducer Pattern for Complex State

When state has multiple related values:

```typescript
type LobbyState = {
  players: Player[];
  settings: Settings;
  status: 'waiting' | 'starting' | 'active';
  error: Error | null;
};

type LobbyAction =
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'UPDATE_SETTINGS'; settings: Settings }
  | { type: 'SET_STATUS'; status: LobbyState['status'] }
  | { type: 'SET_ERROR'; error: Error };

const lobbyReducer = (state: LobbyState, action: LobbyAction): LobbyState => {
  switch (action.type) {
    case 'PLAYER_JOINED':
      return {
        ...state,
        players: [...state.players, action.player],
      };
    case 'PLAYER_LEFT':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.playerId),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: action.status,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
};

// Usage in Context
export const LobbyProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(lobbyReducer, initialState);

  const joinPlayer = useCallback((player: Player) => {
    dispatch({ type: 'PLAYER_JOINED', player });
  }, []);

  const leavePlayer = useCallback((playerId: string) => {
    dispatch({ type: 'PLAYER_LEFT', playerId });
  }, []);

  const value = { ...state, joinPlayer, leavePlayer };

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>;
};
```

---

## Context Best Practices

1. **One Provider Root**: Place providers at app root in logical order
2. **Type Everything**: Always type context values and props
3. **Error Handling**: Throw error if context used outside provider
4. **Memoization**: Memoize complex context values
5. **Split Contexts**: Separate frequently-changing and stable data
6. **Document**: Add JSDoc comments explaining context purpose

```typescript
/**
 * AuthContext provides user authentication state and actions throughout the app.
 * Must be used within AuthProvider.
 * 
 * @example
 * const { user, signIn, signOut } = useAuth();
 */
export const useAuth = () => {
  // Implementation
};
