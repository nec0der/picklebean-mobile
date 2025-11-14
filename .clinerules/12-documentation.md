# Code Documentation

## Required Comments

### 1. Complex Logic

```typescript
// Calculate ELO rating change using K-factor of 32 for new players
// and 16 for experienced players (>30 games) per FIDE standards
const calculateEloChange = (rating: number, gamesPlayed: number) => {
  const kFactor = gamesPlayed > 30 ? 16 : 32;
  return expectedScore * kFactor;
};
```

### 2. Why, Not What

```typescript
// ✅ CORRECT: Explain reasoning
// Using setTimeout to ensure state update completes before navigation
setTimeout(() => navigate('Home'), 0);

// ❌ INCORRECT: Obvious statement
// Navigate to home
navigate('Home');
```

### 3. TODOs

```typescript
// TODO: Implement pagination for better performance
// TODO: Add error boundary for this screen
// FIXME: Race condition when rapidly toggling
```

### 4. Warnings

```typescript
// IMPORTANT: This must run before Firebase initialization
// WARNING: Changing this will break existing user data
```

## JSDoc for Exported Functions

```typescript
/**
 * Validates and formats a room code for lobby joining
 * @param code - Raw room code input from user
 * @returns Formatted uppercase code without spaces
 * @throws {ValidationError} If code format is invalid
 */
export const formatRoomCode = (code: string): string => {
  // Implementation
};
```

## Component Documentation

```typescript
/**
 * UserCard displays user information in a card format
 * 
 * @example
 * <UserCard
 *   user={userData}
 *   onPress={() => navigate('Profile')}
 *   showBadge={true}
 * />
 */
export const UserCard = ({ user, onPress, showBadge }: UserCardProps) => {
  // Implementation
};
