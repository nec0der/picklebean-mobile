# Firebase Best Practices

## Query Optimization

```typescript
// ✅ CORRECT: Limit results
const q = query(
  collection(firestore, 'matches'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// ❌ INCORRECT: Fetch all
const q = collection(firestore, 'matches');
```

## Real-time Listeners

```typescript
// ✅ CORRECT: Cleanup listeners
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(firestore, 'lobbies', roomCode),
    (doc) => setLobby(doc.data())
  );
  return () => unsubscribe();
}, [roomCode]);
```

## Batch Operations

```typescript
// ✅ CORRECT: Use batch for multiple writes
const batch = writeBatch(firestore);
batch.set(doc(firestore, 'users', id), data);
batch.update(doc(firestore, 'lobbies', lobbyId), updates);
await batch.commit();
```

## Security Rules

```javascript
// firestore.rules - Always validate auth
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}
```

## Error Handling

```typescript
// ✅ CORRECT: Handle Firebase errors
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/user-not-found') {
      setError('Invalid credentials');
    }
  }
}
