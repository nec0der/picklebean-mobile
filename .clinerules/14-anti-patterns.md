# Anti-Patterns to Avoid

## Never Do This

### 1. Using `any` Type

```typescript
// ❌ INCORRECT
const data: any = getData();
const process = (input: any) => { };

// ✅ CORRECT
interface UserData {
  id: string;
  name: string;
}
const data: UserData = getData();
const process = (input: UserData): void => { };
```

### 2. Mutating State

```typescript
// ❌ INCORRECT
user.name = 'New Name';
setUser(user);

// ✅ CORRECT
setUser({ ...user, name: 'New Name' });
```

### 3. Inline Styles

```typescript
// ❌ INCORRECT
<View style={{ marginTop: 20 }}>

// ✅ CORRECT
<View className="mt-5">
```

### 4. Missing useEffect Dependencies

```typescript
// ❌ INCORRECT
useEffect(() => {
  fetchData();
}); // Missing dependency array!

// ✅ CORRECT
useEffect(() => {
  fetchData();
}, []);
```

### 5. Unhandled Promises

```typescript
// ❌ INCORRECT
fetchData(); // Not awaited, not caught

// ✅ CORRECT
fetchData().catch(error => console.error(error));
// Or
try {
  await fetchData();
} catch (error) {
  handleError(error);
}
```

### 6. Prop Drilling

```typescript
// ❌ INCORRECT
<ChildComponent user={user} theme={theme} settings={settings} />

// ✅ CORRECT: Use context
const { user, theme, settings } = useApp();
```

### 7. Magic Numbers

```typescript
// ❌ INCORRECT
setTimeout(callback, 300); // What is 300?

// ✅ CORRECT
const DEBOUNCE_DELAY = 300;
setTimeout(callback, DEBOUNCE_DELAY);
```

### 8. Ignoring Platform Differences

```typescript
// ❌ INCORRECT
<TouchableOpacity> // iOS only

// ✅ CORRECT
<Pressable> // Cross-platform
```

### 9. Not Cleaning Up

```typescript
// ❌ INCORRECT
useEffect(() => {
  const timer = setInterval(() => { }, 1000);
}); // Memory leak!

// ✅ CORRECT
useEffect(() => {
  const timer = setInterval(() => { }, 1000);
  return () => clearInterval(timer);
}, []);
```

### 10. Console.logs in Production

```typescript
// ❌ INCORRECT
console.log('User data:', user); // Remove before commit

// ✅ CORRECT
// Remove all console.logs or use proper logging service
```

### 11. Nested Component Definitions

```typescript
// ❌ INCORRECT
export const Parent = () => {
  const Child = () => <Text>Child</Text>; // Re-created every render!
  return <Child />;
};

// ✅ CORRECT
const Child = () => <Text>Child</Text>;
export const Parent = () => <Child />;
```

### 12. Fetching All Documents

```typescript
// ❌ INCORRECT
const q = collection(firestore, 'matches');
const allDocs = await getDocs(q); // Fetches everything!

// ✅ CORRECT
const q = query(
  collection(firestore, 'matches'),
  limit(20)
);
```

## Code Review Red Flags

When you see these patterns, refactor immediately:

- [ ] `any` types without justification
- [ ] Direct state mutation
- [ ] Inline style objects
- [ ] Missing cleanup functions
- [ ] Unhandled async operations
- [ ] Deep prop drilling
- [ ] Magic numbers/strings
- [ ] console.log statements
- [ ] Nested component definitions
- [ ] Unoptimized lists with map
- [ ] Missing error boundaries
- [ ] Hardcoded values that should be constants
