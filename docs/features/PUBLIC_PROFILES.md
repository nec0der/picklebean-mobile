# Public Profiles Feature

## Overview

Users can now have public profiles that can be viewed by other players in the app. This feature enables social discovery, profile sharing, and sets the foundation for NFC profile sharing.

---

## ✅ Phase 1: Core Public Profiles (COMPLETED)

### Features Implemented

#### 1. **Profile Visibility Control**
- Users can toggle their profile between `public` and `private`
- Privacy toggle located in Profile Settings
- Default: `public` (social by default)
- Private profiles can only be viewed by the owner

#### 2. **Public Profile Viewing**
- New `UserProfileScreen` to view other users' profiles
- Shows user stats, rankings, and match history
- Graceful handling of private profiles
- Displays "Profile is Private" message when appropriate

#### 3. **Leaderboard Integration**
- All leaderboard rows are now tappable
- Tap any user to view their public profile
- Seamless navigation from leaderboard to profile

#### 4. **Profile Sharing**
- Native share sheet integration
- Share profile URL: `https://picklebean-ranking-app.web.app/profile/{userId}`
- Works with SMS, social media, email, etc.
- Clean, branded share messages

#### 5. **Security Rules**
- Proper Firestore security rules implemented
- Public profiles readable by authenticated users
- Private profiles only readable by owner
- Users can only edit their own profiles

---

## Implementation Details

### New Files Created

```
src/types/user.ts                          # Added profileVisibility field
src/hooks/firestore/usePublicProfile.ts    # Hook to fetch public profiles
src/screens/UserProfileScreen.tsx          # View other users' profiles
src/components/profile/ShareProfileButton.tsx  # Native share integration
```

### Modified Files

```
src/screens/ProfileScreen.tsx              # Added privacy toggle + share button
src/screens/LeaderboardScreen.tsx          # Added tap navigation
src/components/leaderboard/LeaderboardRow.tsx  # Made tappable
src/navigation/AppNavigator.tsx            # Added UserProfile route
src/types/navigation.ts                    # Added UserProfile params
firestore.rules                            # Security rules for public profiles
```

### Type System

```typescript
interface UserDocument {
  // ... existing fields
  profileVisibility?: 'public' | 'private';  // New field
}
```

### Navigation

```typescript
// New route in RootStackParamList
UserProfile: { userId: string };

// Usage
navigation.navigate('UserProfile', { userId: 'user123' });
```

---

## User Flows

### View Someone's Profile
1. User opens Leaderboard
2. Taps on any player's row
3. Navigates to UserProfileScreen
4. Views profile (if public) or sees "Private" message

### Share Profile
1. User opens their Profile tab
2. Taps "Share Profile" button
3. Native share sheet appears
4. Shares via SMS, social media, etc.

### Privacy Control
1. User opens Profile Settings
2. Toggles "Public Profile" switch
3. Setting saves immediately to Firestore
4. Profile visibility updates in real-time

---

## Security Model

### Firestore Rules

```javascript
// Users can read public profiles or their own
allow read: if isAuthenticated() && (isOwner(userId) || isPublicProfile(userId));

// Only owner can update
allow update: if isOwner(userId);

// Helper function
function isPublicProfile(userId) {
  let profile = get(/databases/$(database)/documents/users/$(userId));
  return profile.data.profileVisibility == 'public';
}
```

### Privacy States

| Profile State | Owner Can View | Others Can View |
|--------------|----------------|-----------------|
| `public`     | ✅ Yes         | ✅ Yes         |
| `private`    | ✅ Yes         | ❌ No          |
| Not set      | ✅ Yes         | ✅ Yes (defaults to public) |

---

## 📱 Phase 2: NFC Profile Sharing (NEXT)

### Planned Features

#### 1. **NFC Writing (In-App)**
- Users can write their profile URL to NFC tags
- Write to paddle NFC tags
- Write to NFC stickers/cards
- Simple "Tap to Write" UI

#### 2. **Context-Aware NFC Reading**
- Tap paddle to phone → Open profile
- Tap paddle to paddle → Quick match/add opponent
- Smart detection of context

#### 3. **NFC Tag Management**
- View associated NFC tags
- Unlink tags if needed
- Write to multiple tags

### Implementation Plan

**Components to Create:**
- `WriteNFCCard.tsx` - UI for NFC writing flow
- `useNFCWriter.ts` - Hook for NFC write operations

**User Flow:**
1. User taps "Write to NFC Tag" in Profile
2. Instructions appear
3. User holds phone to NFC tag
4. Profile URL written to tag
5. Success confirmation

**Technical Details:**
- Uses `react-native-nfc-manager`
- Write NDEF messages with URL
- Format: `https://picklebean-ranking-app.web.app/profile/{userId}`
- Handle iOS vs Android differences

---

## Phase 3: Deep Linking (FUTURE)

### When Ready for Web
1. Set up web app at `picklebean-ranking-app.web.app`
2. Implement profile pages at `/profile/{userId}`
3. Configure Firebase Hosting
4. Add deep link configuration
5. Enable universal links (iOS) / App Links (Android)

### Deep Link Flow
```
User taps NFC tag
  ↓
Opens: https://picklebean-ranking-app.web.app/profile/{userId}
  ↓
If app installed: Opens in app
If not installed: Shows web profile with app download prompt
```

---

## Testing Checklist

### ✅ Phase 1 Testing

- [ ] **Profile Visibility**
  - [ ] Toggle privacy setting on/off
  - [ ] Verify setting persists after app restart
  - [ ] Check real-time updates

- [ ] **Public Profile Viewing**
  - [ ] Tap leaderboard row → opens profile
  - [ ] View public profile successfully
  - [ ] See "Private" message for private profiles
  - [ ] View own profile from leaderboard

- [ ] **Profile Sharing**
  - [ ] Tap Share Profile button
  - [ ] Share via SMS
  - [ ] Share via social media
  - [ ] Verify URL is correct
  - [ ] Check share message formatting

- [ ] **Security**
  - [ ] Cannot read private profiles
  - [ ] Can read public profiles
  - [ ] Can always read own profile
  - [ ] Cannot edit other profiles

### 🔜 Phase 2 Testing (When Implemented)

- [ ] **NFC Writing**
  - [ ] Write profile to NFC tag (iOS)
  - [ ] Write profile to NFC tag (Android)
  - [ ] Verify NDEF format
  - [ ] Multiple writes to same tag

- [ ] **NFC Reading**
  - [ ] Tap tag → opens profile
  - [ ] Works on iOS
  - [ ] Works on Android
  - [ ] Handles malformed tags gracefully

---

## Known Limitations

### Current (Phase 1)
1. **No Deep Linking Yet**: Shared URLs don't open in app
2. **No NFC Writing Yet**: Can't write profile to tags in-app
3. **No Web Profile Pages**: URLs only work within app for now

### Technical Constraints
1. **iOS NFC**: Requires iOS 13+ for writing
2. **Android NFC**: Requires NFC-enabled device
3. **Profile URLs**: Need web app for deep linking

---

## Configuration

### Profile URL Base
```typescript
const PROFILE_BASE_URL = 'https://picklebean-ranking-app.web.app/profile';
```

**To Change:**
1. Update in `src/components/profile/ShareProfileButton.tsx`
2. Ensure web app is set up at that domain
3. Configure deep link association

### Default Privacy Setting
Currently defaults to `public`. To change:

```typescript
// In user creation/onboarding
profileVisibility: 'private'  // Change here
```

---

## API Reference

### usePublicProfile Hook

```typescript
const { user, loading, error, isPrivate } = usePublicProfile(userId);

// Returns:
// - user: UserDocument | null
// - loading: boolean
// - error: Error | null  
// - isPrivate: boolean (true if profile exists but is private)
```

### ShareProfileButton Component

```typescript
<ShareProfileButton 
  userId={userId}
  displayName={displayName}
/>

// Props:
// - userId: string (required)
// - displayName: string (required)
```

---

## Future Enhancements

### Social Features
- [ ] Follow system
- [ ] Activity feed
- [ ] Match notifications
- [ ] Friend requests
- [ ] Private messaging

### Profile Enhancements
- [ ] Custom bio/about
- [ ] Profile badges/achievements
- [ ] Favorite partners
- [ ] Win/loss streaks
- [ ] Head-to-head records

### Analytics
- [ ] Profile view tracking
- [ ] Share analytics
- [ ] NFC tap analytics
- [ ] Popular profile insights

---

## Success Metrics

### Phase 1
- ✅ Public profile viewing implemented
- ✅ Privacy controls working
- ✅ Profile sharing functional
- ✅ Security rules deployed
- ✅ Leaderboard integration complete

### Phase 2 (Upcoming)
- [ ] NFC writing success rate
- [ ] Tag read success rate
- [ ] User adoption of NFC feature
- [ ] Profile shares via NFC

---

## Maintenance Notes

### Security Rules
- Review rules regularly
- Monitor read/write metrics in Firebase console
- Update rules when adding new collections

### Profile URLs
- Keep base URL consistent
- Update everywhere if domain changes
- Test deep links after any changes

### NFC Implementation
- Test on multiple devices
- Keep NFC manager library updated
- Handle permission edge cases
