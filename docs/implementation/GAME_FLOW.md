# PickleBean Game Flow - Implementation Reference

> Complete analysis of web app implementation for mobile port
> Last Updated: November 15, 2025

## Table of Contents
1. [Overview](#overview)
2. [Complete Game Flow](#complete-game-flow)
3. [Screen Analysis](#screen-analysis)
4. [Feature Complexity Matrix](#feature-complexity-matrix)
5. [Data Structures](#data-structures)
6. [Mobile Adaptations](#mobile-adaptations)
7. [Implementation Phases](#implementation-phases)
8. [Critical Insights](#critical-insights)

---

## Overview

The PickleBean game system consists of 3 main screens that handle the complete gameplay lifecycle from lobby creation to match completion and ranking updates.

### Key Technologies Used in Web App:
- **React Router** (navigation)
- **Firestore onSnapshot** (real-time sync)
- **dnd-kit** (drag and drop)
- **react-qrcode-logo** (QR codes)
- **Broadcast Channel API** (cross-tab communication)

### Mobile Adaptations Needed:
- **React Navigation** (instead of React Router)
- **No drag-and-drop** (too complex for mobile)
- **Expo Camera** (for QR scanning - later)
- **Touch-optimized** (larger buttons, sheet modals)

---

## Complete Game Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      FULL GAME LIFECYCLE                     │
└─────────────────────────────────────────────────────────────┘

Start
  ↓
┌─────────────────┐
│  1. Play Screen │  ← Join existing game OR create new
└─────────────────┘
  │ User selects action
  ├─ Join: Enter 4-char code → validate → join lobby
  └─ Host: Select mode (Singles/Doubles) → create lobby
  ↓
┌──────────────────┐
│  2. Lobby Screen │  ← Wait for players, organize teams
└──────────────────┘
  │ Real-time player sync
  ├─ Auto-join to available slot
  ├─ Host can reorganize (web: drag-drop, mobile: simplified)
  ├─ Host can start when enough players
  └─ Players can leave
  ↓
┌─────────────────────┐
│  3. Countdown       │  ← 3... 2... 1... GO!
└─────────────────────┘
  │ Synced countdown via Firestore
  ↓
┌─────────────────┐
│  4. Game Screen │  ← Active gameplay with timer
└─────────────────┘
  │ Timer counting up
  ├─ Host completes game (enter scores)
  └─ Validates pickleball scoring rules
  ↓
┌───────────────────────┐
│  5. Game Summary      │  ← Show results, update rankings
└───────────────────────┘
  │ Display final scores
  ├─ Winner banner (🏆)
  ├─ Points gained/lost (+25/-25)
  ├─ Create match history (all players)
  └─ Update player rankings (immediately in MVP)
  ↓
┌─────────────────┐
│  6. Play Again  │  ← Back to Play Screen
└─────────────────┘
```

---

## Screen Analysis

### 🎮 Screen 1: Play Screen

**Location:** `src/pages/Play.tsx` (web) → `src/screens/PlayScreen.tsx` (mobile)

#### Core Features:
- ✅ **Tab-based UI**: Join tab | Host tab
- ✅ **Join Flow**:
  - Input: 4-character room code (uppercase)
  - Validation: `isValidRoomCode(code)`
  - Check: Lobby exists in Firestore
  - Action: Navigate to `/lobby/:roomCode`
  - Error: "Lobby not found"
  
- ✅ **Host Flow**:
  - Select game mode:
    - 🏓 **Singles (1v1)**
    - 👥 **Doubles (2v2)**
  - Generate: `generateRoomCode()` (4 chars)
  - Create: Lobby document in Firestore
  - Auto-join: Host becomes Team 1, Player 1
  - Action: Navigate to `/lobby/:roomCode`

#### Advanced Features:
- 🔄 **Pending Game Detection**:
  - Checks if user has active lobby
  - Shows "Resume Game" banner
  - Disables create/join when active
  - Uses `usePendingGame()` hook

#### Data Flow:
```typescript
// Create Lobby Structure
{
  roomCode: string,              // 4-char code
  gameMode: 'singles' | 'doubles',
  hostId: string,                // User ID
  createdAt: Date,
  gameStarted: false,
  lastActivity: Date,
  team1: {
    player1: { uid, displayName, photoURL }
  },
  team2: {},
  waitingPlayers: []
}
```

#### Complexity: **⭐ LOW**
- Simple form validation
- Basic Firestore operations
- Straightforward navigation

---

### 🏠 Screen 2: Lobby Screen

**Location:** `src/pages/Lobby.tsx` (web) → `src/screens/LobbyScreen.tsx` (mobile)

#### Core Features:
- ✅ **Real-time Player List**:
  - onSnapshot listener on lobby document
  - Updates automatically when players join/leave
  - Shows player avatars, names
  - Indicates host and current user
  
- ✅ **Team Display**:
  - Team 1 vs Team 2
  - Singles: 1 player per team
  - Doubles: 2 players per team
  - Empty slots show "Waiting for player..."
  
- ✅ **Room Code Display**:
  - Large, prominent display
  - Copy button (dev mode)
  - QR code button (always visible)
  
- ✅ **Host Controls**:
  - **Start Game** button (when enough players)
  - **Close Room** button (X in header)
  - Can reorganize teams (web: drag-drop)
  
- ✅ **Player Controls**:
  - **Leave Room** button (X in header)
  - Auto-join on entry

#### Advanced Features:

##### 🔥 Auto-Join Logic (COMPLEX!)
```typescript
// Race condition prevention
- Check: Is user already in team?
- Check: Is room full?
- Flag: userJustLeft (prevents immediate rejoin)
- Flag: lastUserAction (join/leave tracking)
- Cooldown: 2 seconds after leave

// Singles auto-join:
- If empty: Join Team 1, Slot 1 (host)
- If 1 player: Join opposing team

// Doubles auto-join:
- Fill in order: T1S1 → T1S2 → T2S1 → T2S2
```

##### 🔥 Drag & Drop (Web Only - Skip for Mobile)
```typescript
// Using dnd-kit library
- Host can drag players between slots
- Can swap players (within/between teams)
- Visual feedback during drag
- Updates Firestore on drop
```

##### 🔥 Countdown System (Firestore-synced)
```typescript
// All players see synchronized countdown
Lobby document fields:
- countdownActive: boolean
- countdownValue: 3 | 2 | 1 | 'GO'

// Host manages countdown
useEffect → Update every 1 second
→ 3 → 2 → 1 → GO! → Start Game (800ms delay)

// Full-screen overlay
- Animated entrance
- Large text
- "Starting game..." on GO
```

##### 🔥 Exhibition Match Validation
```typescript
// Gender-based validation
Singles:
- Same gender = Ranked match
- Different gender = Exhibition (no points)

Doubles:
- Same Gender: All male OR all female = Ranked
- Mixed: 1M+1F per team = Ranked
- Other combinations = Exhibition

// Shows warning dialog if exhibition
"Team composition doesn't match standard doubles rules.
This will be an exhibition match with no ranking points."
```

##### 🔥 QR Code Generation
```typescript
// Generates scannable QR
- URL: {origin}/lobby/{roomCode}
- Shows in modal/alert dialog
- Uses react-qrcode-logo library
- "Scan with camera to join game"
```

#### Data Flow:
```typescript
// Lobby Document (Full Structure)
{
  roomCode: string,
  gameMode: 'singles' | 'doubles',
  hostId: string,
  createdAt: Date,
  lastActivity: Date,
  
  // Game state
  gameStarted: boolean,
  gameCompleted?: boolean,
  countdownActive?: boolean,
  countdownValue?: 3 | 2 | 1 | 'GO',
  
  // Exhibition match
  isExhibition?: boolean,
  gameCategory?: 'singles' | 'same_gender_doubles' | 'mixed_doubles',
  
  // Teams
  team1: {
    player1?: Player,
    player2?: Player
  },
  team2: {
    player1?: Player,
    player2?: Player
  },
  
  // Scores (after game)
  finalScores?: {
    team1: number,
    team2: number
  },
  scoreConfirmations?: {
    [playerId: string]: boolean
  },
  
  // Timestamps
  gameStartedAt?: Date,
  gameCompletedAt?: Date,
  
  // Deprecated
  waitingPlayers: []
}
```

#### Complexity: **⭐⭐⭐⭐⭐ VERY HIGH**
- Real-time synchronization complexity
- Auto-join edge cases and race conditions
- Drag-and-drop implementation
- Gender validation with Firestore queries
- Countdown choreography
- Multiple user states to handle

---

### 🎮 Screen 3: Game Screen

**Location:** `src/pages/Game.tsx` (web) → `src/screens/GameScreen.tsx` (mobile)

#### Core Features:
- ✅ **Live Timer**:
  - Counts up from game start
  - Format: MM:SS
  - Uses `gameStartedAt` timestamp
  - Component: `<GameStopwatch />`
  
- ✅ **Team Display**:
  - Shows both teams with players
  - Player avatars and names
  - Host indicator
  - "You" indicator
  
- ✅ **Complete Game** (Host Only):
  - Drawer/Modal with score entry
  - Two number inputs (Team 1, Team 2)
  - Submit button
  - Validation on submit
  
- ✅ **Score Validation**:
  ```typescript
  Rules:
  1. No negative scores
  2. At least one team scored (not 0-0)
  3. Winner has at least 11 points
  4. Win by 2 if both teams ≥ 10
  5. Maximum 50 points (prevent typos)
  
  Examples:
  ✅ 11-0, 11-9, 15-13, 21-19
  ❌ 10-9, 11-10, 11-11, 60-0
  ```

#### Advanced Features:

##### 🔥 Match History Creation
```typescript
// Creates record for EACH player
For each player:
  - gameId: document ID (not roomCode!)
  - playerId: user.uid
  - gameType: 'singles' | 'doubles'
  - gameCategory: 'singles' | 'same_gender_doubles' | 'mixed_doubles'
  - result: 'win' | 'loss'
  - pointsChange: +25 (win) | -25 (loss) | 0 (exhibition)
  - opponentNames: string[] (first names only)
  - partnerName?: string (doubles only)
  - status: 'confirmed' (MVP) | 'pending' (future)
  - isExhibition?: boolean
  - createdAt: Date
```

##### 🔥 Ranking Updates (Immediate in MVP)
```typescript
// Updates user.rankings
User document structure:
{
  rankings: {
    singles: number,              // Default 1000
    sameGenderDoubles: number,    // Default 1000
    mixedDoubles: number          // Default 1000
  },
  matchStats: {
    totalMatches: number,
    wins: number,
    losses: number
  }
}

// Applies points to correct category
Singles game → user.rankings.singles ± points
Same-gender doubles → user.rankings.sameGenderDoubles ± points
Mixed doubles → user.rankings.mixedDoubles ± points

// Uses Firestore batch writes
```

##### 🔥 Game Summary Display
```typescript
After completion:
- Final scores (large)
- Winner banner (🏆 WINNER)
- Points gained/lost per player
  * Green text: +25
  * Red text: -25
  * Gray text: 0 (exhibition)
- Game duration (MM:SS)
- "Play Again" button (all players)
```

##### 🚧 Future: Score Confirmation (Commented Out)
```typescript
// Not implemented in MVP, but code exists
Non-host players:
- See final scores
- "Confirm Score" button
- Updates lobby.scoreConfirmations[userId] = true

When all confirmed:
- Update match history status: pending → confirmed
- Apply ranking points
- Show "All players confirmed" message

Host can edit:
- Reset confirmations
- Reopen score drawer
- Revert match history to pending
```

#### Data Flow:
```typescript
// Game completion flow
1. Host enters scores
2. Validate scores
3. Update lobby document:
   - gameCompleted: true
   - gameCompletedAt: Date
   - finalScores: { team1, team2 }
   - scoreConfirmations: {}

4. Create match history records
   - For each player
   - Calculate points
   - Store in 'matchHistory' collection

5. Update player rankings (MVP: immediately)
   - Batch update all users
   - Update rankings + matchStats

6. Stay on Game Screen (show summary)

7. Navigate to Play on "Play Again"
```

#### Complexity: **⭐⭐⭐⭐ HIGH**
- Firestore batch operations
- Complex points calculation
- Match record creation per player
- Timer management
- Score validation logic
- Multiple async operations

---

## Feature Complexity Matrix

### Play Screen Features:
| Feature | Complexity | Priority | Mobile Status |
|---------|-----------|----------|---------------|
| Tab navigation | ⭐ | Must Have | Use state or tabs |
| Join flow | ⭐ | Must Have | Keep as-is |
| Host flow | ⭐ | Must Have | Keep as-is |
| Room code validation | ⭐ | Must Have | Use existing lib |
| Pending game detection | ⭐⭐ | Should Have | Add later |
| Error handling | ⭐ | Must Have | Keep as-is |

### Lobby Screen Features:
| Feature | Complexity | Priority | Mobile Status |
|---------|-----------|----------|---------------|
| Real-time player list | ⭐⭐ | Must Have | Keep as-is |
| Team display | ⭐ | Must Have | Keep as-is |
| Auto-join logic | ⭐⭐⭐⭐⭐ | Must Have | Simplify significantly |
| Room code display | ⭐ | Must Have | Keep as-is |
| Host controls | ⭐ | Must Have | Keep as-is |
| Player controls | ⭐ | Must Have | Keep as-is |
| Drag-and-drop | ⭐⭐⭐⭐⭐ | Nice to Have | **Skip** (web only) |
| Countdown system | ⭐⭐⭐ | Should Have | Add after MVP |
| Exhibition validation | ⭐⭐⭐⭐ | Should Have | Add after MVP |
| QR code generation | ⭐⭐ | Should Have | Add after MVP |

### Game Screen Features:
| Feature | Complexity | Priority | Mobile Status |
|---------|-----------|----------|---------------|
| Live timer | ⭐⭐ | Must Have | Keep as-is |
| Team display | ⭐ | Must Have | Keep as-is |
| Complete game (host) | ⭐⭐ | Must Have | Use drawer/sheet |
| Score validation | ⭐⭐ | Must Have | Keep as-is |
| Match history creation | ⭐⭐⭐ | Must Have | Keep as-is |
| Ranking updates | ⭐⭐⭐⭐ | Must Have | Keep as-is |
| Game summary | ⭐⭐ | Must Have | Keep as-is |
| Score confirmation | ⭐⭐⭐ | Nice to Have | **Skip** (MVP) |
| Edit scores | ⭐⭐ | Nice to Have | **Skip** (MVP) |

---

## Data Structures

### Player Type
```typescript
interface Player {
  uid: string;
  displayName: string;
  photoURL?: string;
}
```

### Lobby Document (Complete)
```typescript
interface LobbyDocument {
  // Identification
  roomCode: string;
  hostId: string;
  
  // Configuration
  gameMode: 'singles' | 'doubles';
  gameCategory?: 'singles' | 'same_gender_doubles' | 'mixed_doubles';
  isExhibition?: boolean;
  
  // State
  gameStarted: boolean;
  gameCompleted?: boolean;
  countdownActive?: boolean;
  countdownValue?: 3 | 2 | 1 | 'GO';
  
  // Teams
  team1: {
    player1?: Player;
    player2?: Player;
  };
  team2: {
    player1?: Player;
    player2?: Player;
  };
  
  // Scores
  finalScores?: {
    team1: number;
    team2: number;
  };
  scoreConfirmations?: {
    [playerId: string]: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  lastActivity: Date;
  gameStartedAt?: Date;
  gameCompletedAt?: Date;
  
  // Deprecated (keep for backward compatibility)
  waitingPlayers: Player[];
}
```

### Match History Record
```typescript
interface MatchHistoryRecord {
  gameId: string;                    // Lobby document ID
  playerId: string;                  // User ID
  gameType: 'singles' | 'doubles';
  gameCategory: 'singles' | 'same_gender_doubles' | 'mixed_doubles';
  result: 'win' | 'loss';
  pointsChange: number;              // +25, -25, or 0 (exhibition)
  opponentNames: string[];           // First names only
  partnerName?: string;              // Doubles only
  status: 'pending' | 'confirmed';   // MVP: always 'confirmed'
  isExhibition?: boolean;
  createdAt: Date;
}
```

### User Rankings (in User Document)
```typescript
interface UserDocument {
  // ... other user fields
  rankings: {
    singles: number;              // Default: 1000
    sameGenderDoubles: number;    // Default: 1000
    mixedDoubles: number;         // Default: 1000
  };
  matchStats: {
    totalMatches: number;
    wins: number;
    losses: number;
  };
}
```

---

## Mobile Adaptations

### What to Keep (As-Is):
✅ Real-time sync with onSnapshot
✅ Core game flow (Play → Lobby → Game)
✅ Score validation rules
✅ Match history creation
✅ Ranking updates
✅ Team structure
✅ Player auto-join (simplified)

### What to Skip (Initially):
❌ Drag-and-drop reorganization (too complex)
❌ Exhibition match validation (add later)
❌ QR code scanning (needs camera permissions)
❌ Score confirmation workflow (MVP skip like web)
❌ Edit scores feature (MVP skip like web)
❌ Pending game detection (add later)
❌ Broadcast Channel (web-specific)

### What to Simplify:
🔄 **Auto-join logic**: Remove race condition complexity
  - Keep simple version
  - Trust Firestore transactions
  - Remove userJustLeft flag
  - Remove lastUserAction tracking

🔄 **Team reorganization**: Instead of drag-drop
  - Option 1: Host taps player → shows "Move to..." options
  - Option 2: Simple "Swap Players" button
  - Option 3: Skip entirely (auto-assignment only)

🔄 **Countdown**: Start simpler
  - Skip for MVP
  - Add after core gameplay works
  - Or use local countdown (not synced)

### Mobile-Specific Additions:
➕ **Bottom sheet/drawer** for score entry (instead of modal)
➕ **Haptic feedback** on score entry
➕ **Safe area handling** (notches, home indicator)
➕ **Keyboard handling** (KeyboardAvoidingView)
➕ **Pull-to-refresh** on lobby screen
➕ **Swipe gestures** where appropriate

---

## Implementation Phases

### 🎯 Phase 3A: Play Screen (2-3 hours)
**Goal**: Create and join lobbies

**Tasks**:
- [ ] Create tab navigation (Join/Host)
- [ ] Join tab: Room code input + validation
- [ ] Host tab: Game mode selection cards
- [ ] Integrate `useLobbyActions()` hook
- [ ] Navigation to Lobby screen
- [ ] Error handling + messages
- [ ] Loading states

**Components**:
- `PlayScreen.tsx` (main)
- `GameModeCard.tsx` (mode selection)

**Skip for now**:
- Pending game detection
- QR codes
- Analytics tracking

---

### 🎯 Phase 3B: Lobby Screen - Simplified (4-5 hours)
**Goal**: Wait for players, start game

**Tasks**:
- [ ] Create lobby screen with header
- [ ] Real-time player sync (onSnapshot)
- [ ] Team display (Team 1, Team 2)
- [ ] Player slots (filled/waiting)
- [ ] Simple auto-join (no race condition handling yet)
- [ ] Room code display
- [ ] Host controls (Start Game, Close Room)
- [ ] Player controls (Leave Room)
- [ ] Can start game validation
- [ ] Navigation to Game screen

**Components**:
- `LobbyScreen.tsx` (main)
- `PlayerSlot.tsx` (player display)
- `TeamCard.tsx` (team container)

**Skip for now**:
- Drag-and-drop
- Exhibition validation
- Countdown animation
- QR code display
- Complex auto-join logic

---

### 🎯 Phase 3C: Game Screen (4-5 hours)
**Goal**: Play game, record scores, update rankings

**Tasks**:
- [ ] Create game screen layout
- [ ] Live timer component
- [ ] Team display with players
- [ ] Complete game drawer (host only)
- [ ] Score input form
- [ ] Score validation
- [ ] Submit scores
- [ ] Create match history records
- [ ] Update player rankings (batch)
- [ ] Game summary display
- [ ] Winner banner
- [ ] Show points gained/lost
- [ ] "Play Again" button

**Components**:
- `GameScreen.tsx` (main)
- `GameTimer.tsx` (stopwatch)
- `GameSummary.tsx` (results display)
- `ScoreDrawer.tsx` (score entry sheet)

**Skip for now**:
- Score confirmation workflow
- Edit scores feature
- Exhibition match handling

---

### 🎯 Phase 3D: Polish & Enhancements (2-3 hours)
**Goal**: Add features back, improve UX

**Tasks**:
- [ ] Add countdown (3, 2, 1, GO!)
- [ ] Add pending game detection
- [ ] Improve auto-join logic
- [ ] Add haptic feedback
- [ ] Better error states
- [ ] Loading animations
- [ ] Empty states
- [ ] Pull-to-refresh
- [ ] Analytics tracking

**Optional (Future)**:
- [ ] QR code generation
- [ ] Camera QR scanning
- [ ] Drag-and-drop teams
- [ ] Exhibition validation
- [ ] Score confirmation

---

## Critical Insights

### 🔥 Real-time Sync Gotchas:

1. **onSnapshot Cleanup**: Always return unsubscribe function
   ```typescript
   useEffect(() => {
     const unsubscribe = onSnapshot(docRef, callback);
     return () => unsubscribe();
   }, [dependencies]);
   ```

2. **Race Conditions**: Web app has complex logic to prevent
   - User leaves → immediately rejoins
   - Multiple devices joining simultaneously
   - Mobile: Start simple, add complexity only if needed

3. **Firestore Timestamps**: Convert properly on mobile
   ```typescript
   // Firebase Timestamp has .toDate() method
   const date = timestamp.toDate();
   ```

### 🎯 Key Implementation Details:

1. **Room Code**: Always 4 characters, uppercase
2. **Game Modes**: Only 2 (singles, doubles) - not 3
3. **Points**: +25 win, -25 loss, 0 exhibition
4. **Match History**: Uses document ID, not room code
5. **Auto-join**: Fill T1S1 → T1S2 → T2S1 → T2S2 (doubles)
6. **Singles**: Opposing teams (T1 vs T2)
7. **MVP**: Skip score confirmation, apply points immediately

### ⚠️ Common Mistakes to Avoid:

❌ Using room code as game ID (use document ID)
❌ Forgetting to cleanup Firestore listeners
❌ Not validating pickleball scoring rules
❌ Missing exhibition match check (0 points)
❌ Applying points before all players confirm (future feature)
❌ Not handling player leaving during game
❌ Assuming drag-and-drop works on mobile (it doesn't)

### 📚 Helpful Libraries:

**Mobile (React Native)**:
- `@react-navigation/native` - Navigation
- `expo-haptics` - Haptic feedback
- `expo-camera` - QR scanning (future)
- `react-native-qrcode-svg` - QR generation (future)

**Already Have**:
- Firebase Web SDK
- Your custom hooks (useLobby, useLobbyActions, etc.)
- Your utility functions (roomCode, points, validation)

---

## Quick Reference

### Key Functions Already Built:

```typescript
// Room codes
generateRoomCode(): string              // Creates 4-char code
isValidRoomCode(code: string): boolean  // Validates format
validateRoomCode(code: string): { isValid, error }

// Points
calculatePoints(winner, loser): number  // ELO calculation

// Hooks
useLobby(roomCode): { lobby, loading, error, exists }
useLobbyActions(): { createLobby, joinLobby, leaveLobby }
useMatchActions(): { createMatchHistory, updateRankings }
```

### Navigation Flow:

```typescript
Play → Lobby/:roomCode → Game/:roomCode → Play
```

### When to Update Each Screen:

**Play**: 
- On mount (check pending games)
- After leaving lobby/game

**Lobby**:
- Real-time (onSnapshot)
- On player join/leave
- On team change
- On countdown update

**Game**:
- Real-time (onSnapshot)
- Timer every second
- On score completion
- On rankings update

---

## Notes for Future Reference

### Score Confirmation Workflow (Commented Out in Web):

The web app has code for a score confirmation system that's currently disabled in MVP:

1. Host submits scores → Creates match history as 'pending'
2. Non-host players see "Confirm Score" button
3. Each player confirms independently
4. When all confirmed → Update to 'confirmed' → Apply ranking points
5. Host can edit scores → Resets confirmations → Back to pending

**Why it's disabled**: Slows down gameplay, added complexity
**Future consideration**: Could add for tournament/competitive mode

### Exhibition Match Rules:

Detailed gender validation rules (not in MVP):
- **Singles**: Same gender = Ranked, Mixed = Exhibition
- **Doubles Same-Gender**: All male OR all female = Ranked
- **Doubles Mixed**: Exactly 1M+1F per team = Ranked
- **Other**: Exhibition (no points)

Requires fetching gender from all user documents, complex validation.

---

**End of Document**

This document should be updated as implementation progresses. Mark phases complete and add "implementation notes" section for gotchas discovered during development.
