# Naming Conventions

## File Naming

### Components
**PascalCase** for component files:
```
UserCard.tsx
LobbyList.tsx
GameTimer.tsx
ProfilePictureUpload.tsx
```

### Hooks
**camelCase** with `use` prefix:
```
useUser.ts
useAuth.ts
useLobby.ts
useDebounce.ts
```

### Utilities
**camelCase** for utility files:
```
formatDate.ts
validateEmail.ts
generateRoomCode.ts
calculateElo.ts
```

### Types
**camelCase** for type files:
```
user.ts
lobby.ts
game.ts
common.ts
```

### Constants
**camelCase** file, SCREAMING_SNAKE_CASE exports:
```
constants.ts        // File name
API_ENDPOINTS.ts    // Or this for specific constants
```

---

## Variable Naming

### General Variables
**camelCase** for all variables:

```typescript
// ✅ CORRECT
const userProfile = getUserProfile();
const roomCode = 'ABC123';
const playerList = [];

// ❌ INCORRECT
const UserProfile = getUserProfile();  // PascalCase
const room_code = 'ABC123';            // snake_case
const PlayerList = [];                 // PascalCase
```

### Boolean Variables
Use **is/has/can/should** prefixes:

```typescript
// ✅ CORRECT
const isLoading = true;
const hasError = false;
const canEdit = userPermissions.includes('edit');
const shouldUpdate = checkConditions();
const wasSuccessful = result.success;

// ❌ INCORRECT
const loading = true;        // Ambiguous
const error = false;         // Could be error object
const editable = true;       // Less clear
```

### Arrays and Collections
Use plural names:

```typescript
// ✅ CORRECT
const users = [];
const matches = [];
const playerIds = [];

// ❌ INCORRECT
const userList = [];   // Redundant 'List'
const user = [];       // Singular for array
```

---

## Function Naming

### Regular Functions
**camelCase** with verb prefix:

```typescript
// ✅ CORRECT
function calculateScore() { }
function formatUserName() { }
function validateInput() { }
function getPlayerById() { }

// ❌ INCORRECT
function score() { }           // Missing verb
function UserName() { }        // PascalCase
function get_player() { }      // snake_case
```

### Async Functions
Use **fetch/load/submit** verbs:

```typescript
// ✅ CORRECT
async function fetchUserData() { }
async function loadMatches() { }
async function submitScore() { }
async function updateProfile() { }

// ❌ INCORRECT
async function getUserData() { }   // Use 'fetch' for async
async function getMatches() { }    // Use 'load' or 'fetch'
```

### Event Handlers
Use **handle** prefix:

```typescript
// ✅ CORRECT
const handlePress = () => { };
const handleSubmit = () => { };
const handleChange = (text: string) => { };
const handleUserSelect = (id: string) => { };

// ❌ INCORRECT
const onPress = () => { };     // Use 'handle' prefix
const press = () => { };       // Missing prefix
const submit = () => { };      // Missing prefix
```

### Callback Props
Use **on** prefix:

```typescript
// ✅ CORRECT
interface ButtonProps {
  onPress: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

// ❌ INCORRECT
interface ButtonProps {
  press: () => void;         // Missing 'on'
  handleChange: () => void;  // 'handle' is for internal handlers
}
```

---

## Component Naming

### Component Files and Exports
**PascalCase**, descriptive names:

```typescript
// ✅ CORRECT
export const UserProfileCard = () => { };
export const GameTimer = () => { };
export const LobbyPlayerList = () => { };

// ❌ INCORRECT
export const Card = () => { };          // Too generic
export const userProfile = () => { };   // camelCase
export const User_Profile = () => { };  // snake_case
```

### Props Interfaces
Component name + `Props`:

```typescript
// ✅ CORRECT
interface UserCardProps {
  user: User;
  onPress: () => void;
}

export const UserCard = (props: UserCardProps) => { };

// ❌ INCORRECT
interface Props { }              // Too generic
interface IUserCardProps { }     // Don't use I prefix
interface UserCardProperties { } // Use 'Props' suffix
```

---

## Constants

### Global Constants
**SCREAMING_SNAKE_CASE**:

```typescript
// ✅ CORRECT
export const API_BASE_URL = 'https://api.example.com'\;
export const MAX_PLAYERS = 4;
export const DEFAULT_TIMEOUT = 5000;
export const ROOM_CODE_LENGTH = 6;

// ❌ INCORRECT
export const apiBaseUrl = 'https://api.example.com'\;
export const MaxPlayers = 4;
```

### Enum-like Constants
**SCREAMING_SNAKE_CASE** with `as const`:

```typescript
// ✅ CORRECT
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
} as const;

export const GAME_STATE = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;
```

---

## Type Naming

### Interfaces
**PascalCase**, descriptive:

```typescript
// ✅ CORRECT
interface User {
  id: string;
  name: string;
}

interface GameSettings {
  maxPlayers: number;
  timeLimit: number;
}

// ❌ INCORRECT
interface IUser { }        // Don't use I prefix
interface user { }         // camelCase
interface UserInterface {} // Don't add 'Interface'
```

### Type Aliases
**PascalCase** for complex types, camelCase for simple ones optional:

```typescript
// ✅ CORRECT
type UserId = string;
type UserRole = 'player' | 'admin' | 'moderator';
type RequestState = 'idle' | 'loading' | 'success' | 'error';

// Complex types
type UserWithRole = User & { role: UserRole };
```

---

## Directory Naming

### Folders
**camelCase** or **kebab-case**:

```
/src/
  /components/
  /hooks/
  /contexts/
  /utils/  or  /lib/
  /types/
  /screens/  or  /pages/
  /navigation/
```

### Feature Folders
Organize by feature:

```
/components/
  /common/           # Shared components
  /features/
    /lobby/          # Lobby-specific
    /game/           # Game-specific
    /profile/        # Profile-specific
  /ui/               # Base UI components
```

---

## Import Aliases

Use `@` for src directory:

```typescript
// ✅ CORRECT
import { User } from '@/types/user';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/Button';

// ❌ AVOID: Relative imports for distant files
import { User } from '../../../types/user';
```

---

## Test Files

Match source file name with `.test` suffix:

```
UserCard.tsx
UserCard.test.tsx

useAuth.ts
useAuth.test.ts

formatDate.ts
formatDate.test.ts
```

---

## Summary

| Type | Convention | Example |
|------|------------|---------|
| Component Files | PascalCase | `UserCard.tsx` |
| Hook Files | camelCase + use | `useAuth.ts` |
| Util Files | camelCase | `formatDate.ts` |
| Type Files | camelCase | `user.ts` |
| Variables | camelCase | `userName` |
| Booleans | is/has/can + camelCase | `isLoading` |
| Functions | camelCase + verb | `calculateScore` |
| Handlers | handle + camelCase | `handlePress` |
| Callbacks | on + camelCase | `onPress` |
| Components | PascalCase | `UserCard` |
| Interfaces | PascalCase | `UserCardProps` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PLAYERS` |
| Types | PascalCase | `UserId` |
