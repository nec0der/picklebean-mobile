# Performance Optimization

## List Rendering - Critical

### Always Use FlatList

```typescript
// ✅ CORRECT: FlatList with optimization
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
/>

// ❌ INCORRECT: ScrollView with map
<ScrollView>
  {items.map((item) => <ItemCard key={item.id} item={item} />)}
</ScrollView>
```

## Memoization

### React.memo

```typescript
// ✅ CORRECT: Memoize components
export const UserCard = memo(({ user, onPress }: UserCardProps) => {
  return <Pressable onPress={onPress}><Text>{user.name}</Text></Pressable>;
});
```

### useCallback & useMemo

```typescript
// ✅ CORRECT: Memoize callbacks
const handlePress = useCallback((id: string) => {
  navigation.navigate('Details', { id });
}, [navigation]);

// ✅ CORRECT: Memoize expensive calculations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => b.score - a.score);
}, [items]);
```

## Avoid Inline Functions/Objects

```typescript
// ❌ INCORRECT
<Pressable onPress={() => navigate('Details')}>

// ✅ CORRECT
const handlePress = useCallback(() => navigate('Details'), [navigate]);
<Pressable onPress={handlePress}>
```

## Image Optimization

```typescript
// ✅ CORRECT: Proper sizing and caching
<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
/>
```

## Cleanup Subscriptions

```typescript
// ✅ CORRECT: Always cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, setData);
  return () => unsubscribe();
}, []);
