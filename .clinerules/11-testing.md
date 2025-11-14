# Testing Requirements

## Test Coverage

- All utility functions must have unit tests
- All custom hooks should have tests  
- Critical user flows need integration tests

## Test Structure

```typescript
// /__tests__/utils/formatDate.test.ts
import { formatDate } from '@/utils/formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const result = formatDate(new Date('2024-01-01'));
    expect(result).toBe('January 1, 2024');
  });

  it('handles invalid dates', () => {
    const result = formatDate(null);
    expect(result).toBe('Invalid date');
  });
});
```

## Component Testing

```typescript
// Use testID for finding elements
<View testID="user-list">
  <FlatList
    data={users}
    renderItem={renderUser}
    testID="user-flatlist"
  />
</View>
```

## Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useUser } from '@/hooks/useUser';

test('fetches user data', async () => {
  const { result } = renderHook(() => useUser('user123'));
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.user).toBeDefined();
});
