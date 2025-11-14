# TypeScript Rules

## Strict Mode Requirements

- TypeScript strict mode **must** be enabled (`strict: true` in tsconfig.json)
- All code must compile without errors
- No bypassing type checks with workarounds

---

## Type Usage Rules

### No `any` Types

```typescript
// ❌ INCORRECT: Using any
const data: any = getData();
const processData = (input: any) => { };

// ✅ CORRECT: Proper typing
interface UserData {
  id: string;
  name: string;
  email: string;
}

const data: UserData = getData();
const processData = (input: UserData): void => { };

// ✅ CORRECT: Using unknown when type is truly unknown
const data: unknown = getData();
if (typeof data === 'object' && data !== null) {
  // Type narrowing
}
```

### No `@ts-ignore` or `@ts-expect-error`

```typescript
// ❌ INCORRECT: Ignoring type errors
// @ts-ignore
const value = dangerousFunction();

// ✅ CORRECT: Fix the actual type issue
const value = dangerousFunction() as ExpectedType;
// Or better: Fix the function's return type
```

### Explicit Return Types

```typescript
// ❌ INCORRECT: Implicit return type
const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ CORRECT: Explicit return type
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

---

## Type Organization

### Type Files Location

Keep types in `/src/types/` organized by domain:

```
/src/types/
├── user.ts          # User-related types
├── lobby.ts         # Lobby-related types
├── game.ts          # Game-related types
├── common.ts        # Shared/common types
└── api.ts           # API request/response types
```

### Interfaces vs Type Aliases

```typescript
// Use interfaces for objects that can be extended
interface User {
  id: string;
  name: string;
  email: string;
}

interface Player extends User {
  rating: number;
  gamesPlayed: number;
}

// Use type aliases for unions, intersections, and utilities
type UserRole = 'player' | 'admin' | 'moderator';
type UserId = string;
type PlayerWithRole = Player & { role: UserRole };
```

### Proper Type Definitions

```typescript
// ✅ CORRECT: Organized, clear types
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
  showActions?: boolean;
}

interface UserProfileState {
  isEditing: boolean;
  hasChanges: boolean;
}

type UserRole = 'player' | 'admin' | 'moderator';

export type { UserProfileProps, UserProfileState, UserRole };

// ❌ INCORRECT: Inline types, unclear
const UserProfile = (props: { 
  userId: string, 
  onUpdate?: any, 
  showActions?: boolean 
}) => { }
```

---

## Generic Types

### Function Generics

```typescript
// ✅ CORRECT: Proper generic usage
function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json() as T);
}

const user = await fetchData<User>('/api/user');
const users = await fetchData<User[]>('/api/users');
```

### Component Generics

```typescript
// ✅ CORRECT: Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <View>
      {items.map((item) => (
        <View key={keyExtractor(item)}>
          {renderItem(item)}
        </View>
      ))}
    </View>
  );
}
```

---

## Type Guards

```typescript
// ✅ CORRECT: Type guards for narrowing
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

function processData(data: unknown): void {
  if (isUser(data)) {
    // TypeScript knows data is User here
    console.log(data.email);
  }
}
```

---

## Utility Types

Use TypeScript's built-in utility types when appropriate:

```typescript
// Partial - make all properties optional
type PartialUser = Partial<User>;

// Required - make all properties required
type RequiredConfig = Required<Config>;

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name' | 'avatar'>;

// Omit - exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Record - create object type with specific keys
type UserRoles = Record<string, UserRole>;

// ReturnType - extract return type of function
type FetchResult = ReturnType<typeof fetchUserData>;
```

---

## Enum Alternatives

Prefer const objects with `as const` over enums:

```typescript
// ❌ AVOID: Enums (generate extra JS code)
enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Banned = 'BANNED',
}

// ✅ CORRECT: Const object
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
```

---

## React Native Specific Types

```typescript
// Import proper React Native types
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Type screen props
type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Game: { roomCode: string };
};

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// Type styles
interface Styles {
  container: ViewStyle;
  title: TextStyle;
  image: ImageStyle;
}
```

---

## Firebase Types

```typescript
// Type Firestore documents
import type { Timestamp } from 'firebase/firestore';

interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Type converters for Firestore
const userConverter = {
  toFirestore: (user: UserDocument) => {
    return { ...user };
  },
  fromFirestore: (snapshot: any): UserDocument => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
    };
  },
};
```

---

## Best Practices

1. **Export Types**: Always export types that other files might need
2. **Colocate When Possible**: Keep types close to where they're used
3. **Document Complex Types**: Add JSDoc comments for non-obvious types
4. **Use Discriminated Unions**: For state machines or variant types
5. **Avoid Optional Chaining Abuse**: Type properly instead of using `?.` everywhere

```typescript
// ✅ CORRECT: Discriminated union for state
type RequestState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };

// Usage
if (state.status === 'success') {
  // TypeScript knows state.data exists here
  console.log(state.data.name);
}
