# Error Handling

## Error Handling Principles

1. **Always handle errors explicitly**
2. **Provide user-friendly error messages**
3. **Log errors for debugging**
4. **Graceful degradation**
5. **Never silent failures**

---

## Try-Catch Blocks

### Async Functions

```typescript
// ✅ CORRECT: Comprehensive error handling
const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    setLoading(true);
    setError(null);
    
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = { id: userDoc.id, ...userDoc.data() } as User;
    return userData;
    
  } catch (error) {
    console.error('Error fetching user:', error);
    setError(error instanceof Error ? error : new Error('Unknown error'));
    return null;
    
  } finally {
    setLoading(false);
  }
};

// ❌ INCORRECT: Unhandled errors
const fetchUserData = async (userId: string) => {
  const userDoc = await getDoc(doc(firestore, 'users', userId));  // Can throw!
  return userDoc.data();
};
```

### Error Types

```typescript
// ✅ CORRECT: Type-safe error handling
try {
  await submitScore(score);
} catch (error) {
  if (error instanceof FirebaseError) {
    // Handle Firebase-specific errors
    if (error.code === 'permission-denied') {
      showError('You don\'t have permission to perform this action');
    }
  } else if (error instanceof Error) {
    showError(error.message);
  } else {
    showError('An unknown error occurred');
  }
}
```

---

## Error Boundaries

### Component-Level Error Boundaries

```typescript
// /src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-xl font-bold text-red-600 mb-2">
            Something went wrong
          </Text>
          <Text className="text-gray-600 mb-4 text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Pressable 
            onPress={this.handleReset}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <LobbyScreen />
</ErrorBoundary>
```

---

## User-Friendly Error Messages

### Error Message Component

```typescript
// /src/components/common/ErrorMessage.tsx
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage = ({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
}: ErrorMessageProps) => {
  return (
    <View className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <Text className="text-lg font-bold text-red-800 mb-2">{title}</Text>
      <Text className="text-red-700 mb-4">{message}</Text>
      
      <View className="flex-row gap-2">
        {onRetry && (
          <Pressable 
            onPress={onRetry}
            className="flex-1 bg-red-600 py-2 rounded"
          >
            <Text className="text-white text-center font-semibold">
              Try Again
            </Text>
          </Pressable>
        )}
        {onDismiss && (
          <Pressable 
            onPress={onDismiss}
            className="flex-1 bg-gray-200 py-2 rounded"
          >
            <Text className="text-gray-800 text-center font-semibold">
              Dismiss
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

// Usage
if (error) {
  return (
    <ErrorMessage
      title="Unable to load lobby"
      message="Please check your connection and try again."
      onRetry={refetch}
    />
  );
}
```

### Error Message Mapping

```typescript
// /src/lib/errorMessages.ts
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'No internet connection. Please check your network.',
  PERMISSION_DENIED: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT: 'Request timed out. Please try again.',
  INVALID_INPUT: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred.',
} as const;

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return ERROR_MESSAGES.PERMISSION_DENIED;
      case 'not-found':
        return ERROR_MESSAGES.NOT_FOUND;
      case 'unavailable':
        return ERROR_MESSAGES.NETWORK_ERROR;
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return ERROR_MESSAGES.UNKNOWN;
};
```

---

## Loading & Error States

### Standard Pattern

```typescript
// ✅ CORRECT: Handle all states
const { data, loading, error } = useData();

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;
}

if (!data) {
  return <EmptyState message="No data available" />;
}

return <DataView data={data} />;
```

---

## Form Validation Errors

```typescript
// ✅ CORRECT: Display field-specific errors
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const [errors, setErrors] = useState<FormErrors>({});

const validateForm = (): boolean => {
  const newErrors: FormErrors = {};
  
  if (!email) {
    newErrors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    newErrors.email = 'Please enter a valid email';
  }
  
  if (!password) {
    newErrors.password = 'Password is required';
  } else if (password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Display
<View>
  <TextInput value={email} onChangeText={setEmail} />
  {errors.email && (
    <Text className="text-red-600 text-sm mt-1">{errors.email}</Text>
  )}
</View>
```

---

## Network Errors

```typescript
// ✅ CORRECT: Handle network-specific errors
const fetchData = async () => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error (offline, DNS failure, etc.)
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
};
```

---

## Firebase Errors

```typescript
// ✅ CORRECT: Handle Firebase-specific errors
const signIn = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Invalid email or password');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection.');
        default:
          throw new Error('Authentication failed. Please try again.');
      }
    }
    throw error;
  }
};
```

---

## Best Practices

### 1. Always Provide Context

```typescript
// ✅ CORRECT: Descriptive error
throw new Error(`Failed to update user ${userId}: ${error.message}`);

// ❌ INCORRECT: Generic error
throw new Error('Update failed');
```

### 2. Log Errors Appropriately

```typescript
// ✅ CORRECT: Contextual logging
console.error('Error fetching user data:', {
  userId,
  error: error.message,
  timestamp: new Date().toISOString(),
});

// ❌ INCORRECT: No context
console.error(error);
```

### 3. Don't Expose Sensitive Info

```typescript
// ✅ CORRECT: Generic user message
showError('Unable to process payment. Please try again.');

// ❌ INCORRECT: Exposes internal details
showError(`Payment API error: ${apiKey} invalid at endpoint ${endpoint}`);
```

### 4. Handle Async Promise Rejections

```typescript
// ✅ CORRECT: All promises handled
Promise.all([
  fetchUser(id1),
  fetchUser(id2),
]).catch(error => {
  console.error('Error fetching users:', error);
  showError('Failed to load users');
});

// ❌ INCORRECT: Unhandled rejection
Promise.all([fetchUser(id1), fetchUser(id2)]);  // Can fail silently!
```

### 5. Clean Up on Errors

```typescript
// ✅ CORRECT: Cleanup in finally
let subscription: (() => void) | null = null;

try {
  subscription = subscribeToUpdates(handleUpdate);
  await processData();
} catch (error) {
  handleError(error);
} finally {
  subscription?.();
}
```
