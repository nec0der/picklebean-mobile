# Current Sprint: Play Flow Enhancements

## Sprint Status: 🎯 Planning Complete - Ready for Implementation

The mobile app core features are complete. This sprint focuses on enhancing the play flow with competitive features, transparency, and social engagement.

---

## 🎯 SPRINT GOALS

Transform the play flow to be **competitive, transparent, and social** with:

1. **Easy Joining** via QR code scanner
2. **True ELO System** with dynamic K-factor based on player experience
3. **Visible Stakes** showing point predictions before matches
4. **Quick Rematch** functionality (host-controlled, one-click)
5. **Social Sharing** of match results

---

## 🔍 CURRENT STATE ANALYSIS

### ✅ What's Working:

- **Solid ELO Foundation**: Functions exist in `points.ts` with proper formula
- **Match Creation**: `matchService.ts` handles history and rankings
- **User Data**: Rankings, games played, gender tracked
- **Game Flow**: Lobby → Game → Summary works end-to-end
- **QR Display**: QR button exists in `LobbyDetailScreen`

### ⚠️ Issues to Fix:

1. **Fixed K-Factor**: Currently hardcoded at 25, doesn't vary with rating gaps
2. **No Stakes Preview**: Players don't see potential point changes before game
3. **No QR Scanner**: Can display QR but can't scan to join
4. **Hardcoded Points Display**: GameSummary shows ±25 for everyone
5. **No Rematch**: Players must recreate lobbies manually
6. **No Sharing**: Can't share victories socially

---

## 📦 PHASE BREAKDOWN

### **PHASE 1: QR Code Scanner** 🎯
**Priority**: HIGH | **Est**: 2-3 hours | **Status**: 📋 Planned

**Goal**: Players can scan QR codes to join lobbies instantly

#### Technical Details:
- Use `expo-camera` with barcode scanning
- Parse URLs: `picklebean://lobby/ABCD`, `https://...`, or direct `ABCD`
- Handle camera permissions gracefully
- Provide success feedback (haptic + visual)

#### Files to Create/Modify:
- ✨ **NEW**: `src/components/features/play/QRScannerModal.tsx`
- 📝 **MODIFY**: `src/screens/PlayScreen.tsx` (add scanner button)
- 📝 **MODIFY**: `app.json` (camera permissions)

#### Checklist:
- [ ] Verify/install expo-camera
- [ ] Create QRScannerModal component
  - [ ] Camera view with overlay
  - [ ] Barcode scanning
  - [ ] URL parsing logic
  - [ ] Permission handling
  - [ ] Success feedback
- [ ] Add "Scan QR" button to PlayScreen (Join tab)
- [ ] Add camera permission to app.json
- [ ] Test scanning lobby QR codes
- [ ] Handle error cases

---

### **PHASE 2: True ELO System** 🎲
**Priority**: HIGHEST | **Est**: 3-4 hours | **Status**: 📋 Planned

**Goal**: Dynamic ELO with K-factor based on player experience

#### Current Formula:
```typescript
// points.ts - Line 6
const K_FACTOR = 25; // Fixed - NEEDS UPDATE

// Line 17
const expectedScore = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
const pointsChange = Math.round(K_FACTOR * (1 - expectedScore));
```

#### Proposed K-Factor System:
```typescript
// Industry-standard adaptive K-factor:
- New players (< 30 games): K = 32 (volatile, fast learning)
- Intermediate (30-99 games): K = 24 (stabilizing)
- Experienced (100+ games): K = 16 (stable, established)
```

#### Example Scenarios:
```
Team 6000 vs Team 3000 (3000 rating gap):
- Favorites win: +0-2 points (expected outcome)
- Favorites lose: -30-32 points (major upset)

Team 5200 vs Team 4800 (400 rating gap):
- Higher rated wins: +12-14 points
- Lower rated wins: +18-20 points
```

#### Files to Modify:
- 📝 `src/lib/points.ts` (add `getKFactor()`, update signatures)
- 📝 `src/services/matchService.ts` (pass `gamesPlayed`)
- 📝 `src/types/user.ts` (ensure `gamesPlayed` field)
- 📝 `src/services/userService.ts` (increment `gamesPlayed`)

#### Checklist:
- [ ] Add `getKFactor()` function to `points.ts`
- [ ] Update `calculatePointsChange()` signature
- [ ] Update `calculateDoublesPointsChange()`
- [ ] Pass `gamesPlayed` in `matchService.ts`
- [ ] Ensure `gamesPlayed` field tracked in user docs
- [ ] Update increment logic on match completion
- [ ] Test with various player experience levels
- [ ] Verify minimum 1 point for wins

---

### **PHASE 3: Stakes Display** 💰
**Priority**: HIGH | **Est**: 2 hours | **Status**: 📋 Planned

**Goal**: Show point predictions before game starts

#### Visual Design:
```
┌──────────────────────────┐
│    Match Stakes          │
├──────────────────────────┤
│ Team 1 (Avg: 5200)       │
│ • Win:  +18 pts each     │  ← Green
│ • Lose: -14 pts each     │  ← Red
│                          │
│ Team 2 (Avg: 4800)       │
│ • Win:  +14 pts each     │
│ • Lose: -18 pts each     │
└──────────────────────────┘
```

#### Implementation:
1. **Hook**: `useStakesCalculation` fetches ratings, calculates scenarios
2. **Component**: `StakesPreview` displays stakes with visual hierarchy
3. **Integration**: Shows in `LobbyDetailScreen` before "Start Game"
4. **Summary**: Update `GameSummary` to display real calculated points

#### Files to Create/Modify:
- ✨ **NEW**: `src/hooks/game/useStakesCalculation.ts`
- ✨ **NEW**: `src/components/features/lobby/StakesPreview.tsx`
- 📝 **MODIFY**: `src/screens/LobbyDetailScreen.tsx` (add preview)
- 📝 **MODIFY**: `src/components/game/GameSummary.tsx` (real points)

#### Checklist:
- [ ] Create `useStakesCalculation` hook
  - [ ] Fetch all player ratings
  - [ ] Calculate team averages
  - [ ] Calculate win/lose scenarios
  - [ ] Return formatted stakes data
- [ ] Create `StakesPreview` component
  - [ ] Team-by-team display
  - [ ] Win points (green) / Lose points (red)
  - [ ] Highlight current user's team
- [ ] Add to `LobbyDetailScreen` (before "Start Game")
- [ ] Update `GameSummary` to show real points (not hardcoded ±25)
- [ ] Test accuracy of predictions

---

### **PHASE 4: Rematch Functionality** 🔄
**Priority**: MEDIUM | **Est**: 2 hours | **Status**: 📋 Planned

**Goal**: Host can start rematch with same players, one click

#### User Flow:
1. Game ends → Summary screen
2. **Host sees**: "🔄 Create Rematch" button (prominent)
3. **Non-host sees**: "Back to Home" button (standard)
4. Host clicks → New lobby created with:
   - New room code
   - Same game mode
   - Same players (auto-positioned)
   - Fresh game state
5. Host navigates to new lobby
6. Other players can rejoin via notification/manually

#### Implementation:
```typescript
// lobbyService.ts
createRematch(previousLobby, hostId) → newRoomCode
  - Generate new code
  - Copy settings & players
  - Reset game state
  - Return new code

// useLobbyActions.ts
const { createRematch } = useLobbyActions();

// GameSummary.tsx
{isHost ? (
  <Button onPress={handleRematch}>🔄 Create Rematch</Button>
) : (
  <Button onPress={goHome}>Back to Home</Button>
)}
```

#### Files to Modify:
- 📝 `src/services/lobbyService.ts` (add `createRematch()`)
- 📝 `src/hooks/actions/useLobbyActions.ts` (expose rematch)
- 📝 `src/components/game/GameSummary.tsx` (rematch button)

#### Checklist:
- [ ] Add `createRematch()` to `lobbyService.ts`
  - [ ] Generate new room code
  - [ ] Copy lobby settings
  - [ ] Reset game state (gameStarted: false)
  - [ ] Preserve all players
- [ ] Add rematch hook to `useLobbyActions`
- [ ] Update `GameSummary` component
  - [ ] Host: "Create Rematch" button
  - [ ] Non-host: "Back to Home" button
  - [ ] Navigation logic
- [ ] Test rematch flow end-to-end
- [ ] Verify all players preserved correctly

---

### **PHASE 5: Share Functionality** 📤
**Priority**: MEDIUM | **Est**: 2 hours | **Status**: 📋 Planned

**Goal**: Share match results on social media

#### Share Message Format:
```
🏓 Picklebean Match Result

🏆 VICTORY!

Final Score: 11 - 9
Mode: Doubles

My Ranking: +18 points 📈

Play with me! Download Picklebean
```

#### Implementation:
- Use `expo-sharing` or `react-native-share`
- Button in `GameSummary` (above "Play Again")
- Format message with match details
- Include call-to-action

#### Files to Create/Modify:
- ✨ **NEW**: `src/lib/share.ts` (utility functions)
- 📝 **MODIFY**: `src/components/game/GameSummary.tsx` (share button)

#### Checklist:
- [ ] Install `expo-sharing` package
- [ ] Create `shareMatchResult()` utility
  - [ ] Format match details
  - [ ] Include player stats
  - [ ] Add CTA for app download
- [ ] Add share button to `GameSummary`
  - [ ] Icon + text ("Share Result")
  - [ ] Position above "Play Again"
  - [ ] Handle share errors gracefully
- [ ] Test sharing on iOS
- [ ] Test sharing on Android
- [ ] Handle share cancellation

---

## 🗂️ FILES SUMMARY

### New Files (4):
1. `src/components/features/play/QRScannerModal.tsx`
2. `src/hooks/game/useStakesCalculation.ts`
3. `src/components/features/lobby/StakesPreview.tsx`
4. `src/lib/share.ts`

### Modified Files (9):
1. `src/screens/PlayScreen.tsx`
2. `src/lib/points.ts`
3. `src/services/matchService.ts`
4. `src/types/user.ts`
5. `src/services/userService.ts`
6. `src/screens/LobbyDetailScreen.tsx`
7. `src/components/game/GameSummary.tsx`
8. `src/hooks/actions/useLobbyActions.ts`
9. `app.json`

---

## ⏱️ TIME ESTIMATES

| Phase | Description | Time | Priority |
|-------|-------------|------|----------|
| Phase 1 | QR Scanner | 2-3h | HIGH |
| Phase 2 | True ELO | 3-4h | HIGHEST |
| Phase 3 | Stakes Display | 2h | HIGH |
| Phase 4 | Rematch | 2h | MEDIUM |
| Phase 5 | Share | 2h | MEDIUM |
| **Testing** | Integration testing | 2-3h | HIGH |
| **TOTAL** | | **13-16h** | |

**Sprint Duration**: 2-3 days (part-time) or 2 days (full-time)

---

## 📊 PROGRESS TRACKER

### Overall: 0% Complete (0/5 phases)

- [ ] **Phase 1: QR Scanner** (0%)
- [ ] **Phase 2: True ELO** (0%)
- [ ] **Phase 3: Stakes Display** (0%)
- [ ] **Phase 4: Rematch** (0%)
- [ ] **Phase 5: Share** (0%)

### Completed Features: None yet
### In Progress: Sprint planning complete
### Blocked: None

---

## 🎯 SUCCESS CRITERIA

Sprint is complete when:

- ✅ Players can scan QR codes to join lobbies instantly
- ✅ ELO calculations vary based on rating gaps and player experience
- ✅ Players see potential point changes before starting game
- ✅ Host can create rematch with one click
- ✅ Players can share victories on social media
- ✅ All calculations are accurate and fair
- ✅ No bugs or crashes in play flow
- ✅ Professional UI/UX throughout

---

## 📝 IMPLEMENTATION NOTES

### About ELO System:
- Using **proven Elo formula** from chess/competitive gaming
- K-factor adapts to player experience (industry standard)
- Minimum 1 point ensures visible progress
- Maximum K points prevents exploitation

### About Stakes Display:
- Shows BEFORE game starts (pre-game transparency)
- Scores entered AFTER match ends (confirmed by user)
- Predictions help players understand competitive balance

### About Rematch:
- **Host-only control** for simplicity and clarity
- Instant lobby creation (no manual recreation)
- All players auto-positioned (seamless UX)
- One-click convenience

### About Sharing:
- Text format initially (fastest implementation)
- Optional future: Image card generation
- Includes app download CTA (growth mechanism)

---

## 🚀 NEXT STEPS

1. **Phase 1**: Start with QR Scanner (high value, clear scope)
2. **Phase 2**: Implement True ELO (most complex, highest priority)
3. **Phase 3**: Add Stakes Display (depends on Phase 2)
4. **Phase 4**: Add Rematch (independent, can be done anytime)
5. **Phase 5**: Add Sharing (independent, can be done anytime)

**Current Status**: Documentation complete, ready for implementation! 🎉

---

## 📚 REFERENCES

- **Web App**: `/Users/niazemiluulu/Code/picklebean-ranking-app`
  - QR implementation in `Lobby.tsx` (line ~615)
  - Uses `react-qrcode-logo` for display
- **ELO Standards**: FIDE chess ratings (K=40 new, K=20 intermediate, K=10 master)
- **Adapted for Picklebean**: K=32/24/16 for faster progression

---

Last Updated: December 10, 2024
