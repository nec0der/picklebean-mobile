# NFC Username Fix

## Problem

When scanning NFC tags with profile URLs, the system was failing to add players to lobbies because it was treating the username as a user ID (document ID).

**Error Flow:**
```
NFC URL: https://picklebean-ranking-app.web.app/profile/test
         ↓ (extracts "test")
Code assumed: "test" is a userId (document ID)
         ↓
getDoc(doc(firestore, 'users', 'test'))  ← FAILS!
```

**Root Cause:**
- User documents are stored by UID (e.g., `"abc123xyz"`)
- The `username` field inside the document contains `"test"`
- The URL contains the username, not the UID
- Code was treating URL segment as document ID

## Solution

Added a two-step lookup process:

1. **Extract username from URL** (not userId)
2. **Query Firestore to get userId from username**
3. Continue with existing logic using the userId

## Implementation

### 1. Updated `src/lib/nfc.ts`

**Added Functions:**
- `extractUsernameFromNFCUrl()` - Renamed from `extractUserIdFromNFCUrl` for clarity
- `getUserIdFromUsername()` - New async function to query Firestore by username

```typescript
/**
 * Get user ID from username by querying Firestore
 * @param username - Username to look up
 * @returns User ID (UID) or null if not found
 */
export const getUserIdFromUsername = async (username: string): Promise<string | null> => {
  try {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first matching user's document ID (UID)
    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error('Error looking up user by username:', error);
    return null;
  }
};
```

### 2. Updated `src/screens/LobbyDetailScreen.tsx`

**Modified `handleNFCTagRead()` function:**

```typescript
// Before:
const scannedUserId = extractUserIdFromNFCUrl(url);
if (!scannedUserId) {
  toast.error("Invalid NFC tag format");
  return true;
}

// After:
const scannedUsername = extractUsernameFromNFCUrl(url);
if (!scannedUsername) {
  toast.error("Invalid NFC tag format");
  return true;
}

// Look up userId from username
const scannedUserId = await getUserIdFromUsername(scannedUsername);
if (!scannedUserId) {
  toast.error("Player not found");
  return true;
}
```

## Files Modified

1. **`src/lib/nfc.ts`**
   - Added Firestore imports
   - Renamed `extractUserIdFromNFCUrl` to `extractUsernameFromNFCUrl`
   - Added `getUserIdFromUsername()` function
   - Kept legacy export for backwards compatibility

2. **`src/screens/LobbyDetailScreen.tsx`**
   - Updated import to use new function names
   - Modified `handleNFCTagRead()` to perform username lookup
   - Added error handling for "Player not found" case

## Testing

To test the fix:

1. Create an NFC tag with profile URL: `https://picklebean-ranking-app.web.app/profile/test`
2. Start a lobby as host
3. Tap "Scan Players" 
4. Scan the NFC tag
5. Player with username "test" should be added to the lobby

## Benefits

- ✅ NFC tags now work correctly with profile URLs
- ✅ Proper error messages ("Player not found" vs "Invalid format")
- ✅ Maintains backwards compatibility
- ✅ Clean separation of concerns (parse URL → lookup user → add to lobby)
- ✅ Type-safe implementation with proper error handling

## Related

- NFC tag writing: `src/components/profile/WriteNFCCard.tsx`
- Profile URL format: Uses username, not userId
- Web app: `picklebean-ranking-app.web.app/profile/{username}`

---

**Date**: December 16, 2024  
**Status**: ✅ Complete  
**TypeScript Errors**: 0
