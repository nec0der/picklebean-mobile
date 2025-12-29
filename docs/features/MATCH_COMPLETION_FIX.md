# Match Completion Security Rules Fix

## Issue: Rankings Not Updating After Match Completion

**Date:** December 28, 2025  
**Status:** ✅ Fixed  
**Priority:** Critical

## The Problem

After completing a game, match records were created in the match history, but player rankings were not being updated. This was caused by **two critical security rule issues**:

### Issue #1: Missing `matchHistory` Collection Rules

The code writes to `matchHistory` collection:
```typescript
// matchHistory.ts
const matchRef = doc(collection(firestore, 'matchHistory'));
batch.set(matchRef, { ... });
```

But security rules only had a `matches` collection defined (different name!):
```javascript
match /matches/{matchId} {  // ❌ Wrong collection name
  allow create: if ...;
}
```

**Result:** All writes to `matchHistory` were silently denied (Firestore's default deny policy).

### Issue #2: Permission Denied on User Ranking Updates

Security rules only allowed users to update their own profiles:
```javascript
match /users/{userId} {
  allow update: if isOwner(userId);  // ❌ Only self-updates allowed
}
```

But `completeMatch()` tries to update ALL players' rankings (including opponents):
```typescript
for (const playerId of allPlayerIds) {
  batch.update(userRef, { 
    ranking: currentRanking + playerPoints,
    wins: ...,
    losses: ...,
  });
}
```

**Result:** Host could only update their own ranking; all other players' updates failed silently.

## The Solution

### 1. Added `matchHistory` Security Rules

```javascript
match /matchHistory/{matchId} {
  // Anyone authenticated can read match history
  allow read: if isAuthenticated();
  
  // Anyone authenticated can create match records
  allow create: if isAuthenticated();
  
  // Immutable records (no updates/deletes)
  allow update: if false;
  allow delete: if false;
}
```

### 2. Updated User Profile Rules to Allow Match Stats Updates

Created a helper function to validate match-related updates:
```javascript
function isMatchStatsUpdate() {
  let affectedKeys = request.resource.data.diff(resource.data).affectedKeys();
  let allowedKeys = ['ranking', 'wins', 'losses', 'totalMatches', 'lastMatchAt'].toSet();
  return affectedKeys.hasOnly(allowedKeys);
}
```

Updated the users collection rule:
```javascript
match /users/{userId} {
  allow update: if isOwner(userId) ||   // Own profile updates
    (isAuthenticated() && isMatchStatsUpdate());  // Match completion updates
}
```

This allows **any authenticated user** to update match statistics (ranking, wins, losses, etc.) but prevents them from modifying other profile fields like name, photo, email, etc.

## Security Considerations

### Why This is Safe for MVP

1. **Field-level validation**: Only `ranking`, `wins`, `losses`, `totalMatches`, and `lastMatchAt` can be updated
2. **Authentication required**: Anonymous users cannot manipulate rankings
3. **Audit trail**: Match history records are immutable and provide full audit trail
4. **Client-side validation**: Score validation prevents invalid scores from being submitted

### Why This is NOT Production-Ready

1. **Manipulation risk**: Malicious users could potentially call the batch write directly
2. **No host verification**: Any authenticated user can complete matches, not just the lobby host
3. **No rate limiting**: Could be abused to spam ranking updates

## Recommended Future Improvements

### Move to Cloud Functions (Production)

For production, migrate `completeMatch()` to a Firebase Cloud Function with admin privileges:

```typescript
// functions/src/index.ts
export const completeMatch = functions.https.onCall(async (data, context) => {
  // Verify user is lobby host
  // Verify lobby exists and game is in progress
  // Perform batch writes with admin SDK
  // Return success/failure
});
```

**Benefits:**
- ✅ Secure: No client-side manipulation possible
- ✅ Atomic: Guaranteed consistency
- ✅ Auditable: Server-side logging
- ✅ Scalable: Can add complex validation logic

**Requirements:**
- Firebase Blaze plan (paid)
- Cloud Functions deployment
- Additional complexity

## Testing

### Test Scenarios

1. ✅ Host completes game with 4 players (doubles)
2. ✅ All 4 players' rankings update correctly
3. ✅ Match history records created for all players
4. ✅ Winner gets positive points, loser gets negative points
5. ✅ Non-host players see updated rankings immediately

### How to Test

1. Create a doubles lobby with 4 players
2. Start the game
3. Complete the game with final scores
4. Check all 4 players' profiles - rankings should update
5. Check match history - records should exist for all players

## Files Modified

- `firestore.rules` - Added matchHistory rules and updated users rules

## Deployment

```bash
firebase deploy --only firestore:rules
```

## Related Issues

- Sprint: Phase 2 - True ELO System (points calculation)
- Feature: Match completion flow
- Feature: Player ranking system

## Notes

This is an **MVP solution** suitable for development and initial testing. Before launching to production with real users, migrate to Cloud Functions for proper security and data integrity.
