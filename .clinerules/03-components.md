# Component Architecture

## Component File Structure

### One Component Per File

```typescript
// ✅ CORRECT: One component per file, proper naming
// /src/components/features/lobby/LobbyCard.tsx
import { View, Text, Pressable } from 'react-native';
import { memo } from 'react';
import type { Lobby } from '@/types/lobby';

interface LobbyCardProps {
  lobby: Lobby;
  onPress: (lobbyId: string) => void;
}

export const LobbyCard = memo(({ lobby, onPress }: LobbyCardProps) => {
  const handlePress = () => {
    onPress(lobby.id);
  };

  return (
    <Pressable onPress={handlePress} className="p-4 bg-white rounded-lg">
      <Text className="text-lg font-bold">{lobby.name}</Text>
      <Text className="text-gray-600">{lobby.playerCount} players</Text>
    </Pressable>
  );
});

// Export types for consumers
export type { LobbyCardProps };
```

---

## Component Rules

### 1. Functional Components Only
- No class components
- Use hooks for state and lifecycle

### 2. Named Exports
- Use named exports (not default exports)
- Easier for refactoring and find-all-references

```typescript
// ✅ CORRECT: Named export
export const UserProfile = () => { };

// ❌ INCORRECT: Default export
export default function UserProfile() { }
```

### 3. Props Interface
- Always define explicit props interface
- Export props type for external use

```typescript
// ✅ CORRECT: Explicit props interface
interface UserCardProps {
  user: User;
  onPress?: () => void;
  showBadge?: boolean;
}

export const UserCard = ({ user, onPress, showBadge = false }: UserCardProps) => {
  // Implementation
};

export type { UserCardProps };
```

### 4. Memo Optimization
- Use `React.memo()` for components with stable props
- Especially important for list items

```typescript
// ✅ CORRECT: Memoized component
export const ListItem = memo(({ item, onPress }: ListItemProps) => {
  return (
    <Pressable onPress={onPress}>
      <Text>{item.name}</Text>
    </Pressable>
  );
});
```

### 5. Single Responsibility
- Each component should do one thing well
- Max 250 lines per component
- Break larger components into subcomponents

### 6. Small, Focused Components
- Extract repeated JSX into separate components
- Create composition over complex conditionals

---

## Component Organization

Standard order within a component:

```typescript
import { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/auth/useAuth';
import type { User } from '@/types/user';

// Props interface
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

// Component
export const UserProfile = memo(({ userId, onUpdate }: UserProfileProps) => {
  // 1. Hooks (in order: useState, useEffect, useCallback/useMemo, custom hooks)
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();
  
  useEffect(() => {
    // Fetch user data
  }, [userId]);
  
  // 2. Event handlers (use handle prefix)
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);
  
  const handleSave = useCallback(async () => {
    // Save logic
    onUpdate?.(userData);
    setIsEditing(false);
  }, [userData, onUpdate]);
  
  // 3. Computed values
  const canEdit = currentUser?.id === userId;
  const displayName = userData?.displayName || 'Unknown User';
  
  // 4. Early returns (loading, error states)
  if (!userData) {
    return <LoadingSpinner />;
  }
  
  if (!canEdit) {
    return <NoPermission />;
  }
  
  // 5. Main render
  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold">{displayName}</Text>
      <Pressable onPress={handleEdit}>
        <Text>Edit Profile</Text>
      </Pressable>
    </View>
  );
});

// Export types
export type { UserProfileProps };
```

---

## Component Patterns

### Container/Presentational Pattern

```typescript
// Container component (logic)
export const UserProfileContainer = ({ userId }: { userId: string }) => {
  const { user, loading, error } = useUser(userId);
  const { updateUser } = useUserActions();
  
  const handleUpdate = useCallback(async (updates: Partial<User>) => {
    await updateUser(userId, updates);
  }, [userId, updateUser]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;
  
  return <UserProfileView user={user} onUpdate={handleUpdate} />;
};

// Presentational component (UI)
interface UserProfileViewProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
}

export const UserProfileView = memo(({ user, onUpdate }: UserProfileViewProps) => {
  return (
    <View className="p-4">
      <Text className="text-2xl">{user.displayName}</Text>
      {/* Pure UI rendering */}
    </View>
  );
});
```

### Compound Components Pattern

```typescript
// Parent component
export const Card = ({ children }: { children: ReactNode }) => {
  return <View className="bg-white rounded-lg shadow">{children}</View>;
};

// Subcomponents
Card.Header = ({ children }: { children: ReactNode }) => {
  return <View className="p-4 border-b border-gray-200">{children}</View>;
};

Card.Body = ({ children }: { children: ReactNode }) => {
  return <View className="p-4">{children}</View>;
};

Card.Footer = ({ children }: { children: ReactNode }) => {
  return <View className="p-4 border-t border-gray-200">{children}</View>;
};

// Usage
<Card>
  <Card.Header>
    <Text>Title</Text>
  </Card.Header>
  <Card.Body>
    <Text>Content</Text>
  </Card.Body>
</Card>
```

---

## Event Handlers

### Naming Convention

```typescript
// ✅ CORRECT: Use handle prefix
const handlePress = () => { };
const handleSubmit = async () => { };
const handleChange = (text: string) => { };

// ❌ INCORRECT: Unclear naming
const press = () => { };
const onPress = () => { };  // This should be a prop name
const submit = () => { };
```

### Optimization

```typescript
// ✅ CORRECT: Memoized handler
const handlePress = useCallback(() => {
  navigation.navigate('Details', { id: item.id });
}, [navigation, item.id]);

// ✅ CORRECT: Handler with parameters
const handleUserSelect = useCallback((userId: string) => {
  navigation.navigate('Profile', { userId });
}, [navigation]);

// ❌ INCORRECT: Inline function (causes re-renders)
<Pressable onPress={() => navigate('Details')}>
```

---

## Props Best Practices

### Optional Props with Defaults

```typescript
// ✅ CORRECT: Default values in destructuring
interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button = ({ 
  title, 
  variant = 'primary', 
  disabled = false 
}: ButtonProps) => {
  // Implementation
};
```

### Children Prop

```typescript
// ✅ CORRECT: Proper children typing
import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
  return <View className={className}>{children}</View>;
};
```

### Callback Props

```typescript
// ✅ CORRECT: Optional callbacks with proper types
interface FormProps {
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
}

export const Form = ({ onSubmit, onCancel, onError }: FormProps) => {
  const handleSubmit = async () => {
    try {
      const data = getFormData();
      onSubmit?.(data);  // Optional chaining for optional callbacks
    } catch (error) {
      onError?.(error as Error);
    }
  };
  
  // Implementation
};
```

---

## Component Testing

### Write Testable Components

```typescript
// ✅ CORRECT: Testable component
interface UserListProps {
  users: User[];
  onUserPress: (userId: string) => void;
}

export const UserList = ({ users, onUserPress }: UserListProps) => {
  return (
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <UserCard user={item} onPress={() => onUserPress(item.id)} />
      )}
      keyExtractor={(item) => item.id}
      testID="user-list"
    />
  );
};

// Easy to test:
// - Can pass mock users array
// - Can verify onUserPress is called
// - testID for finding element in tests
```

---

## Avoid Common Mistakes

```typescript
// ❌ INCORRECT: Nested component definitions
export const Parent = () => {
  const Child = () => <Text>Child</Text>;  // Re-created on every render!
  return <Child />;
};

// ✅ CORRECT: Define outside or extract
const Child = () => <Text>Child</Text>;

export const Parent = () => {
  return <Child />;
};

// ❌ INCORRECT: Direct DOM manipulation
const ref = useRef<View>(null);
ref.current?.measure((x, y) => {
  // Avoid when possible
});

// ✅ CORRECT: Use React state and props
const [position, setPosition] = useState({ x: 0, y: 0 });
