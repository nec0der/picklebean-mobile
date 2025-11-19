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

## ✅ Phase 1 Complete - Core Data & Types

**All tasks completed:**
- ✅ Types: `user.ts`, `lobby.ts`, `game.ts` 
- ✅ Hooks: `useLobby`, `useMatches`, `useLeaderboard`, `usePendingGame`
- ✅ Utilities: `points.ts`, `validation.ts`, `roomCode.ts`
- ✅ Services: `lobbyService`, `matchService`, `userService`
- ✅ Actions: `useLobbyActions`, `useMatchActions`
- ✅ NFC: Full event-driven implementation (bonus!)

---

## 🎯 Current Focus: Phase 3 - Game Features (2-3 days)

### Goal
Build complete game flow: Lobby countdown → Game screen → Score entry → Match completion

### Important Notes
- **NO real-time scoring** - Scores entered AFTER game completes
- **Countdown: "ZERO-ZERO-START!"** - Custom pickleball-themed countdown
- **Synchronized via Firestore** - All players see same countdown
- **Haptic feedback** - On each countdown step

---

### Phase 3A: Lobby Countdown (Day 1, 5-6 hours) 🔴 IN PROGRESS

**Goal:** Host can start game with synchronized countdown

**Tasks:**
- [ ] Add "Start Game" button to LobbyDetailScreen (host only)
- [ ] Validate lobby is full before allowing start
- [ ] Create CountdownOverlay component (full-screen)
- [ ] Implement countdown logic in useLobbyCountdown hook
- [ ] Sequence: ZERO → ZERO → START! (1 sec each)
- [ ] Real-time sync via Firestore (countdownActive, countdownValue)
- [ ] Haptic feedback on each step (MEDIUM, MEDIUM, HEAVY)
- [ ] Navigate to GameScreen on complete
- [ ] Update lobby: gameStarted = true, gameStartedAt = timestamp

**Components to create:**
- `src/components/features/lobby/CountdownOverlay.tsx`
- `src/hooks/lobby/useLobbyCountdown.ts` (optional)

**Lobby document updates:**
```typescript
{
  countdownActive?: boolean;
  countdownValue?: 'ZERO' | 'START!';
  gameStarted: boolean;
  gameStartedAt?: Timestamp;
}
```

---

### Phase 3B: Game Screen (Day 1-2, 3-4 hours)

**Goal:** Display active game with timer

**Tasks:**
- [ ] Create GameScreen.tsx
- [ ] Add to navigation: /game/:roomCode
- [ ] Fetch lobby with useLobby(roomCode)
- [ ] Create GameTimer component (MM:SS stopwatch)
- [ ] Display both teams with player avatars/names
- [ ] Host: Show "Complete Game" button
- [ ] All players: Show "Leave Game" button
- [ ] Handle loading/error states
- [ ] Show "You" indicator for current user
- [ ] Show host indicator

**Components to create:**
- `src/screens/GameScreen.tsx`
- `src/components/game/GameTimer.tsx`
- `src/components/game/TeamDisplay.tsx` (optional)

**Timer logic:**
```typescript
// Calculate elapsed time
const elapsed = Date.now() - lobby.gameStartedAt.toDate().getTime();
const seconds = Math.floor(elapsed / 1000);
const minutes = Math.floor(seconds / 60);
const displaySeconds = seconds % 60;
// Format: MM:SS
```

---

### Phase 3C: Score Entry & Completion (Day 2, 3-4 hours)

**Goal:** Host enters scores, system creates history and updates rankings

**Tasks:**
- [ ] Create ScoreEntryDrawer component (bottom sheet/modal)
- [ ] Two number inputs (Team 1 score, Team 2 score)
- [ ] Validate on submit (pickleball scoring rules)
- [ ] Show validation errors clearly
- [ ] Submit scores to Firestore
- [ ] Update lobby: finalScores, gameCompleted, gameCompletedAt
- [ ] Create match history record for EACH player
- [ ] Calculate points: Winner +25, Loser -25
- [ ] Batch update all player rankings
- [ ] Update matchStats (totalMatches, wins, losses)
- [ ] Handle submission errors gracefully

**Components to create:**
- `src/components/game/ScoreEntryDrawer.tsx`

**Scoring rules (from validation.ts):**
```typescript
1. No negative scores
2. At least one team scored (not 0-0)
3. Winner must have at least 11 points
4. Win by 2 if both teams >= 10
5. Maximum 50 points (prevent typos)
```

**Match history structure:**
```typescript
{
  gameId: string;        // Lobby doc ID
  playerId: string;
  gameType: 'singles' | 'doubles';
  result: 'win' | 'loss';
  pointsChange: number;  // ±25
  opponentNames: string[];
  partnerName?: string;
  status: 'confirmed';   // MVP: always confirmed
  createdAt: Date;
}
```

---

### Phase 3D: Game Summary (Day 2-3, 1-2 hours)

**Goal:** Show results after game completion

**Tasks:**
- [ ] Create GameSummary component
- [ ] Show winner banner with 🏆
- [ ] Display final scores (large, prominent)
- [ ] Show points gained/lost per player:
  - Green text: +25
  - Red text: -25
- [ ] Display game duration (MM:SS)
- [ ] "Play Again" button → Navigate to Play screen
- [ ] Optional: Confetti animation for winners

**Components to create:**
- `src/components/game/GameSummary.tsx`

---

### Phase 3E: Polish & Testing (Day 3, 2-3 hours)

**Goal:** Improve UX and handle edge cases

**Tasks:**
- [ ] Add haptic feedback throughout:
  - Countdown steps
  - Score submission
  - Game completion
- [ ] Loading animations
- [ ] Error boundaries on all screens
- [ ] Confirmation dialog: Leave game?
- [ ] Confirmation dialog: Close lobby?
- [ ] Handle player leaving during game
- [ ] Test singles mode
- [ ] Test doubles mode
- [ ] Test validation edge cases
- [ ] Pull-to-refresh on lobby (optional)
- [ ] Empty states

---

## ⏱️ Phase 3 Timeline

**Total: 2-3 days** (13-17 hours)

**Day 1 (5-9 hrs):**
- Morning: Countdown implementation (5-6 hrs)
- Afternoon: Basic game screen (3-4 hrs)

**Day 2 (5-7 hrs):**
- Morning: Score entry + validation (2-3 hrs)
- Afternoon: Match history + rankings (2-3 hrs)
- Evening: Game summary (1-2 hrs)

**Day 3 (2-3 hrs):**
- Polish, haptics, testing

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
