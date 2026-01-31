# Session Creation Flow — V1 (LOCKED)

> **Status:** LOCKED - No changes without explicit approval  
> **Core Goal:** Create a session in ≤ 5 seconds, without thinking, without leaving context.

---

## One-Sentence Product Test

> "If a user can't create a session while walking to the court with one hand, the flow is too heavy."

---

## 0. Preconditions

- User is on Map tab
- Map already knows:
  - User location
  - Visible courts
  - Last interacted court (if any)
- **There is no standalone "Sessions" area in the app.**

---

## 1. Entry Points (Only Two)

### Entry A — Global CTA (Primary)

| Location | Bottom Map floating action bar |
|----------|-------------------------------|
| Button | "+ Session" |
| Used when | User wants to host, User doesn't care about browsing first |
| Priority | This is the default path |

### Entry B — Court Context (Secondary)

| Location | Court bottom sheet |
|----------|-------------------|
| Button | "Create session" |
| Used when | User is already exploring a specific court |

---

## 2. Court Auto-Selection Logic (Critical)

### Priority Order (Strict)

```
1. If user tapped a court → That court is selected
2. Else if user has checked in → That court is selected
3. Else → Nearest court within 500m
4. If no court is found → Show "No court nearby" view
```

### No Court Found State

- Disable Confirm button
- Show subtle helper text: "Move closer to a court to create a session"
- **No modal. No alert.**

---

## 3. Create Session Screen (Single Screen)

> **This is NOT a wizard. No steps. No progress indicators.**

### Layout (Top → Bottom)

#### A. Court (Read-only)

| Field | Behavior |
|-------|----------|
| Content | Court name |
| Editable | No |
| If user wants different court | Use back gesture |

#### B. Time (Primary Control)

| Default | "Now" if current time + 10min < end of day, else next 30-min slot |
| Control | Inline time slot chips |
| Options | "Now", +30min, +60min, +90min, +120min |
| Date picker | None |
| Same-day only | Yes (V1) |

#### C. Duration (Preset Chips)

| Options | 60 min (default), 90 min, 120 min |
| Custom input | None |

---

## 4. Actions (Bottom)

| Primary | **Confirm** |
|---------|-------------|
| Secondary | Cancel |
| Preview | None |
| Confirmation modal | None |

---

## 5. Post-Confirm Behavior (Critical)

Immediately after tapping Confirm:

1. ✅ User is checked in (if not already)
2. ✅ Session becomes active or scheduled
3. ✅ Map updates silently
4. ✅ Create screen dismisses
5. ✅ User returns to Map

### What Does NOT Happen

- ❌ No toast
- ❌ No "session created" screen
- ❌ No animation
- ❌ No confirmation message

> If users need reassurance, **the map state is the reassurance.**

---

## 6. Map Result (What User Sees)

After creation:

- Court avatar switches to Active Session state
- Subtle ring/dot indicator appears
- **Nothing else changes visually**

The user should feel: *"Cool. It's live."*

---

## 7. Edge Cases (Handled Automatically)

| Edge Case | Behavior |
|-----------|----------|
| User closes app | Session still exists |
| User leaves area | Session still exists |
| User creates without being checked in | Auto check-in |
| Session end time reached | Auto cleanup |

**No user intervention required.**

---

## 8. What the Flow Explicitly Avoids

These features do **NOT exist** in V1:

- ❌ Court search during session creation
- ❌ Session descriptions
- ❌ Titles
- ❌ Max players
- ❌ Invite lists
- ❌ Skill levels
- ❌ Chat prompts
- ❌ Recurring sessions
- ❌ Date picker (same-day only)

> If any of these appear, the flow is broken.

---

## Implementation Status

### ✅ Completed

- [x] Navigation types updated (`CreateSession` route)
- [x] GravityMapScreen "+ Session" wired
- [x] GravityMapScreen passes court context
- [x] CreateSessionScreen single-screen UI
- [x] Court auto-selection fallback (nearest court)
- [x] "No court nearby" view
- [x] Duration presets (60, 90, 120)
- [x] Time slot presets (Now, +30, +60, +90, +120)
- [x] sessionService.createSession() integration
- [x] Silent dismiss (no toast, no confirmation)

### 🔲 Future (NOT V1)

- [ ] Actual distance calculation for nearest court
- [ ] Check-in integration
- [ ] "Hosting as Picklebean" toggle (for groups)

---

## Files

| File | Purpose |
|------|---------|
| `src/screens/gravity/CreateSessionScreen.tsx` | Main screen |
| `src/screens/gravity/GravityMapScreen.tsx` | Entry point navigation |
| `src/services/sessionService.ts` | Firestore operations |
| `src/types/session.ts` | Type definitions |
| `src/types/navigation.ts` | Route params |

---

## Design Philosophy

The session creation flow embodies these principles:

1. **Zero friction** — No explanations, no confirmations
2. **Context preservation** — Never leave the map mentally
3. **One-handed operation** — Everything reachable with thumb
4. **Trust the map** — The map IS the feedback
5. **Invisible when working** — Users shouldn't notice the UI
