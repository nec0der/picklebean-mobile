# Court Pin System V1 (LOCKED)

> **Status:** Locked - No changes without explicit approval

## Design Goals (Non-Negotiable)

Court pins must:
1. **Communicate state, not data**
2. **Be readable in < 1 second**
3. **Feel alive, not noisy**
4. **Never dominate the map**

If users start "reading pins", the design failed.

---

## The 4 Pin States (ONLY THESE)

No more. No fewer.

### 1. INACTIVE (Default)

**Meaning:** "This court exists, but nothing is happening."

| Property | Value |
|----------|-------|
| Visual | Small solid dot |
| Color | Neutral gray (`#9CA3AF`) |
| Animation | None |
| Label | None |

**Rules:**
- Lowest visual priority
- Must fade into the map
- Always visible when zoomed in enough

*This pin exists purely for orientation, not decision-making.*

---

### 2. PRESENCE (Check-ins, No Session)

**Meaning:** "Someone is here or just arrived."

| Property | Value |
|----------|-------|
| Visual | Same gray dot + soft halo pulse |
| Animation | 2s breathing cycle |
| Halo color | Accent blue at < 20% opacity |

**Rules:**
- Pulse opacity maxes at **18%**
- No bounce, no color change on dot
- Dot itself stays neutral gray

*This signals life, not urgency.*

---

### 3. SESSION (The Important One)

**Meaning:** "A session is happening or about to happen."

| Property | Value |
|----------|-------|
| Visual | Replace dot with avatar cluster |
| Avatars | 2-3 overlapping circles |
| Shadow | Slight elevation |
| Numbers | None |

**Rules:**
- Max 3 avatars shown
- More players ≠ bigger pin
- Cluster size stays constant

*This avoids the "popular = big" trap.*

---

### 4. SELECTED (Temporary Focus State)

**Meaning:** "User is interacting with this court."

| Property | Value |
|----------|-------|
| Visual | Slight scale up (105%) |
| Brightness | Slightly increased |
| Ring | Optional thin ring |

**Rules:**
- Only one selected at a time
- Removed immediately on dismiss
- Never animated aggressively

*This is feedback, not emphasis.*

---

## Color Rules (VERY STRICT)

You get **one accent color** for activity.

| Element | Color |
|---------|-------|
| Inactive dot | Neutral gray (`#9CA3AF`) |
| Active halo | Accent blue at low opacity |
| Session avatars | User avatars only |
| Selection ring | Light blue (`#60A5FA`) |

### Do NOT:
- ❌ Color-code by skill
- ❌ Color-code by court type
- ❌ Use multiple colors for states

**Color ≠ information here. Motion = information.**

---

## Motion Rules (CRITICAL)

Motion is the language of presence.

### Allowed
- ✅ Slow pulse (active presence)
- ✅ Gentle fade in/out
- ✅ Subtle scale on select

### Forbidden
- ❌ Bounce
- ❌ Flash
- ❌ Ripple explosions
- ❌ Continuous spinning

*The pin should feel like it's **breathing**, not alerting.*

---

## Zoom Behavior

### Zoomed Out
- Pins cluster naturally (map SDK clustering)
- Show state, not individuals
- No numbers unless forced by SDK

### Zoomed In
- Individual court pins appear
- Avatar clusters only when relevant

*Never overload zoomed-out views.*

---

## Interaction Behavior

| Action | Result |
|--------|--------|
| Tap on dot | Open court bottom sheet |
| Tap on avatar cluster | Open active session |
| Tap on selected pin | No extra action |

**No long press. No hidden gestures.**

---

## What We Explicitly DO NOT Show

Never on pins:
- ❌ Number of players
- ❌ Skill levels
- ❌ Ratings
- ❌ Badges
- ❌ Guild icons
- ❌ Emojis

*If users want details → bottom sheet.*

---

## Why This System Works

1. **Calm at rest**
2. **Informative in motion**
3. **Scales to hundreds of courts**
4. **Doesn't bias users toward "popular" courts**
5. **Encourages redistribution** (underutilized courts still visible)

This directly solves: **overloaded vs underutilized courts**

Without shaming or gamifying.

---

## Implementation Details

### Files

| File | Purpose |
|------|---------|
| `src/components/gravity/CourtPin.tsx` | Pin component with 4-state logic |
| `src/types/court.ts` | Court type with session/presence data |
| `src/mocks/courts.ts` | Mock data with varied states |

### Type Extensions

```typescript
// In Court.derived
hasActiveSession: boolean;      // Triggers SESSION state
sessionAvatars?: string[];      // Avatar URLs (max 3)
activePlayersNow: number;       // > 0 triggers PRESENCE
```

### Animation Constants

```typescript
PULSE_DURATION: 1600,       // 1.6s cycle - more noticeable
PULSE_MAX_OPACITY: 0.15,    // 15% - sweet spot
SELECT_SCALE: 1.05,         // 5% scale
PULSE_SCALE: 1.6,           // Halo pulse multiplier
```

### Size Constants (UPDATED - Avatars are PRIMARY interactive objects)

```typescript
DOT: 16,                    // Core dot size
HALO: 22,                   // 1.4× dot for proportion
AVATAR_SIZE: 28,            // 40% larger - readable, tappable (was 20)
AVATAR_OVERLAP: 10,         // Adjusted for larger avatars (was 8)
CLUSTER_BASE: 44,           // Apple HIG minimum tap target (was 34)
CONTAINER: 56,              // Marker hitbox - includes touch margin
ANCHOR_DOT: 10,             // Spatial grounding dot
```

### Avatar Interaction Rules (LOCKED)

**Core Principle:** "Court avatars are the product, not map details"

1. **Minimum tap target:** 44 × 44pt (Apple HIG compliant)
2. **Avatar size does NOT scale with map zoom** - fixed screen size
3. **Tap behavior:** Opens court bottom sheet (only)
4. **No user profiles, no session pages from pins**
5. **Avatars represent presence at a court, not people-first objects**

**Test:** "Can I glance at the map for 2 seconds and immediately understand where people are — and tap it without effort?"


### Visual Grounding

Session pins include a **base ring** for grounding:
- Semi-transparent white ring under avatars
- Creates "pop" against any map background
- Passes the 1-meter test

---

## Testing Checklist

- [ ] Inactive courts show gray dot only
- [ ] Presence courts pulse slowly (2s cycle)
- [ ] Session courts show avatar cluster
- [ ] Selected courts scale 5%
- [ ] Pulse opacity never exceeds 18%
- [ ] Dot color never changes (always gray)
- [ ] No bounce/flash animations
- [ ] Works with 100+ courts on map
