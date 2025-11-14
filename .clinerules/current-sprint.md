# Current Sprint: Web-to-Mobile Migration - Phase 1

## Sprint Goal

Build core data layer and type system to match web app functionality, preparing for full feature migration.

---

## ✅ Foundation Complete (Sprint 0)

The following foundational work has been completed:

- ✅ NativeWind configured and working
- ✅ Base UI components created (Button, Card, Input, LoadingSpinner, ErrorMessage)
- ✅ Navigation structure implemented (Bottom tabs + Auth flow)
- ✅ Firebase Web SDK integrated with environment variables
- ✅ Email/password authentication working with persistence
- ✅ AuthContext provider with protected routes
- ✅ All placeholder screens created
- ✅ App runs smoothly in Expo Go
- ✅ Code follows style guidelines
- ✅ Project structure established with TypeScript strict mode

**7 commits** successfully made to local repository.

---

## 🎯 Current Focus: Phase 1 - Core Data & Types (2-3 days)

### Goal
Extend mobile app types and create Firestore hooks to match web app's data structure.

### Tasks

#### 1. Update Type Definitions ⏳
**Files to modify:**
- `src/types/user.ts`
- `src/types/lobby.ts`
- `src/types/game.ts` (create new)

**Add to User types:**
```typescript
- UserRankings (singles, doubles categories)
- MatchHistoryRecord
- MatchStats
- Verification status fields
- Admin/ban flags
```

**Add to Lobby types:**
```typescript
- Team structure (player1, player2)
- Game modes (singles/doubles)
- Countdown system
- Score confirmations
- Exhibition match flags
```

**Create Match types:**
```typescript
- Match history structure
- Confirmation system
- Points calculation
```

#### 2. Build Firestore Hooks 🔨
**Create in `/src/hooks/firestore/`:**

- `useUserProfile.ts` - Fetch user with rankings
- `useLobby.ts` - Real-time lobby listener
- `useMatches.ts` - User match history
- `useLeaderboard.ts` - Rankings by category
- `usePendingConfirmations.ts` - Unconfirmed matches

**Hook Pattern:**
```typescript
// Return: { data, loading, error, refetch }
// Always cleanup listeners in useEffect
```

#### 3. Create Utility Functions 📦
**Create in `/src/lib/`:**

- `lobbyUtils.ts` - Room code generation, validation
- `pointsCalculation.ts` - ELO-style ranking updates
- `matchUtils.ts` - Match creation, confirmation logic

---

## 📋 Upcoming Phases Overview

### Phase 2: Profile & Onboarding (2-3 days)
- Onboarding flow with photo upload
- Profile screen with rankings display
- Edit profile functionality
- Match statistics view

### Phase 3: Core Game Features (3-4 days) 🎯 **PRIORITY**
- Lobby creation/joining (QR + code)
- Real-time game screen
- Score tracking with haptics
- Confirmation system

### Phase 4: Secondary Features (2-3 days)
- Leaderboard screen
- Match history screen
- Dashboard with stats

### Phase 5: Admin Features (2 days) - Optional
- User verification
- Ban management

### Phase 6: Polish (2-3 days)
- Loading states
- Error boundaries
- Offline handling
- Performance optimization

---

## 🚨 Temporary Rules (EAS Pending)

### Current Limitations (Web SDK)

**Still Using:**
- ✅ Firebase Web SDK (not native)
- ✅ Email/password only (no Google Sign-In)
- ✅ Expo Go for testing
- ✅ Mock data for development

**Cannot Use Yet:**
- ❌ Google Sign-In
- ❌ Push notifications
- ❌ Native Firebase optimizations
- ❌ Custom native modules
- ❌ Production builds

### After EAS Approval
1. Switch to native Firebase SDK
2. Implement Google Sign-In
3. Add push notifications
4. Create development builds
5. Test on physical devices

---

## 📊 Priority System

### 🔴 Must Have (MVP)
- Lobby system
- Game screen with scoring
- Match confirmation
- Basic leaderboard

### 🟡 Should Have
- Profile with rankings
- Match history
- Onboarding flow

### 🟢 Nice to Have
- Admin features
- Analytics
- Push notifications

---

## ⏱️ Timeline

**Phase 1 (Current):** 2-3 days  
**MVP Complete (Phases 1-3):** 6-9 days  
**Full Features (Phases 1-4):** 9-13 days  
**Complete (All phases):** 15-20 days

*Estimate assumes ~4-6 hours focused work per day*

---

## 📱 Mobile-Specific Adaptations

### Key Differences from Web

1. **Image Handling**
   - Use `expo-image-picker` (not HEIC conversion)
   - Compress images before upload
   - Handle camera permissions

2. **QR Codes**
   - Use `expo-camera` + `expo-barcode-scanner`
   - Request camera permissions
   - Fallback to manual code entry

3. **Timers**
   - Use React Native timing APIs
   - Background timer handling
   - App state management

4. **Navigation**
   - Bottom tabs (not sidebar)
   - Stack navigation for details
   - Swipe gestures

5. **Haptics**
   - `expo-haptics` for feedback
   - Score changes, confirmations
   - Platform-specific handling

---

## 💻 Development Workflow

### Daily Checklist
- [ ] Pull latest changes (when on team)
- [ ] Run Expo Go: `npx expo start`
- [ ] Work on current phase tasks
- [ ] Test on both iOS and Android (Expo Go)
- [ ] Commit with conventional commit format
- [ ] Update task progress

### Testing
```bash
cd /Users/niazemiluulu/Code/picklebean-mobile
npx expo start
```
Scan QR with Expo Go app (iOS/Android)

### Commit Standards
```bash
feat: add user rankings types
fix: lobby listener cleanup
refactor: extract points calculation
docs: update API documentation
```

---

## 🎯 Code Quality Standards (Always)

- ✅ Type everything explicitly (no `any`)
- ✅ Use proper error handling (try/catch, error states)
- ✅ Clean up listeners in useEffect returns
- ✅ Follow naming conventions (camelCase, PascalCase)
- ✅ No console.logs in commits
- ✅ Test on both iOS and Android
- ✅ Memoize expensive operations
- ✅ Use NativeWind for all styling
- ✅ Document complex logic with comments

---

## 📚 Reference

### Web App Location
`/Users/niazemiluulu/Code/picklebean-ranking-app`

### Key Web App Files to Reference
- `src/types/user.ts` - Complete user type system
- `src/types/lobby.ts` - Full lobby structure
- `src/pages/Game.tsx` - Game logic implementation
- `src/pages/Lobby.tsx` - Lobby management
- `src/contexts/AuthContext.tsx` - Auth patterns

### Mobile App Structure
```
src/
├── components/      # UI components
├── screens/         # Screen components
├── navigation/      # Navigation setup
├── contexts/        # Context providers
├── hooks/           # Custom hooks
├── types/           # TypeScript types
├── lib/             # Utility functions
└── config/          # Configuration
```

---

## 🚧 Known Issues / Blockers

*Document any issues here as they arise*

---

## ✅ Definition of Done (Phase 1)

Phase 1 is complete when:

- [ ] All web app types replicated in mobile
- [ ] Firestore hooks created and tested
- [ ] Utility functions implemented
- [ ] No TypeScript errors
- [ ] Hooks properly clean up listeners
- [ ] Code follows all style guidelines
- [ ] Ready to build screens in Phase 2

---

## 📝 Notes

- Keep Web SDK limitations in mind
- Reference web app for implementation patterns
- Document decisions in DECISIONS.md
- Update this file as you progress
- Mark tasks complete as you go
