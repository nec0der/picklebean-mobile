# Court Avatar System V1.1 - LOCKED DESIGN CONTRACT

> **Status:** LOCKED - No changes without explicit approval
> **V1.1 Refinements:** Avatar size increased to 34pt, overflow pill semi-opaque

---

## Core Principle (Non-Negotiable)

**Avatars represent COURT ACTIVITY, not individuals.**

They are signals, not profiles.

- Tap → **Court bottom sheet**
- Never tap → User profile (V1)

---

## 1. Avatar States (Exact Definitions)

### State A — Solo Presence

**Meaning:** One user is physically at the court (checked in, no session)

| Property | Value |
|----------|-------|
| Visual | Single circular avatar |
| Size | 28–32pt visible |
| Border | Subtle white (1–2pt) |
| Badge | None |
| Animation | None |

**Behavior:**
- Always tappable
- Opens court bottom sheet
- No pulsing, no animation

**Use case:** "Someone is there. You might join."

---

### State B — Group Presence (No Session)

**Meaning:** Multiple users checked in, casually playing or waiting

| Property | Value |
|----------|-------|
| Visual | 2–4 overlapping avatars |
| Layout | Horizontal or slight diagonal overlap |
| Size | Same as solo avatar |
| Max visible | 3 avatars |
| Overflow | +N pill (e.g. "+2") |

**Behavior:**
- Entire cluster is a single tap target
- Opens court bottom sheet
- Still calm, no animation

**Use case:** "People are already here."

---

### State C — Active Session

**Meaning:** A scheduled or ongoing session exists at the court

| Property | Value |
|----------|-------|
| Visual | Avatar cluster (same rules as group) |
| Indicator | Thin colored ring OR small dot badge (top-right) |
| Color | Brand accent (same as "Create session") |

**Behavior:**
- Opens court bottom sheet
- Bottom sheet may highlight: "Session ongoing" or "Session planned"
- No countdowns, no timers on map

**Use case:** "Something intentional is happening here."

---

## 2. Avatar Size & Interaction Rules (CRITICAL)

### Minimum Tap Area

| Requirement | Value |
|-------------|-------|
| Hit area | **44 × 44pt** (absolute minimum) |
| Visual size | Can be smaller |
| Invisible hit box | Acceptable |

> If this is violated → **UX is broken.**

---

### Zoom Behavior (VERY IMPORTANT)

**Avatars DO NOT scale with map zoom.**

| Rule | Description |
|------|-------------|
| Visual size | Stays consistent |
| Scale range | Optional ±10–15% max |
| Never | Shrink into unreadability |
| Never | Grow into dominance |

> Think: **Apple Maps pins**, not raw MapKit annotations.

---

## 3. Pins vs Avatars vs Clusters (When to Switch)

### Zoom Level Logic

| Zoom Level | Display | Purpose |
|------------|---------|---------|
| **Zoomed Out** (City/Region) | Simple dots/pins, no avatars | Orientation only |
| **Mid Zoom** (Neighborhood) | Pins → avatars, clusters allowed | Discovery |
| **Close Zoom** (Court Area) | Avatars fully visible, no scaling | Decision-making |

---

### Cluster Rules (STRICT)

| Rule | Value |
|------|-------|
| Max visible avatars | **3** |
| 4+ users | Show `+N` indicator |
| Clusters per court | **Never more than one** |
| Density increase | Reduce information, never add more |

---

## 4. Tap Feedback (Minimal but Intentional)

### On Press

| Feedback | Value |
|----------|-------|
| Scale | 95–97% (subtle) |
| Haptic | Light impact |
| Animation | None (no bounce, no ripple) |

### On Release

| Action | Result |
|--------|--------|
| Immediate | Bottom sheet presentation |
| Delay | None |

### NEVER Do

- ❌ Long press actions
- ❌ Hover previews
- ❌ Avatar expansion on tap
- ❌ Profile popups

---

## 5. What Avatars Will NEVER Show (V1 Lock)

❌ Skill level  
❌ Ratings  
❌ Names  
❌ Guild / organization badges  
❌ Session times on map  
❌ Numbers over faces (except +N)  

> All of that belongs inside the bottom sheet or future layers, **not the map**.

---

## 6. Sanity Check (Design Test)

Ask this during review:

> "If I open the app for 5 seconds, can I instantly tell where people are and tap them without precision?"

**If the answer is not yes → the avatar system is wrong.**

---

## 7. Implementation Reference

### Current Constants (CourtPin.tsx) — V1.1

```typescript
SIZES = {
  AVATAR_SIZE: 34,        // 34pt visible (V1.1: increased from 28)
  AVATAR_OVERLAP: 12,     // Cluster overlap (V1.1: proportional)
  CLUSTER_BASE: 44,       // Hit area (Apple HIG)
  CONTAINER: 60,          // Marker container (V1.1: increased)
  OVERFLOW_HEIGHT: 22,    // +N pill height
}

COLORS = {
  OVERFLOW_BG: 'rgba(55, 65, 81, 0.85)',  // Semi-opaque dark (V1.1)
  SESSION_RING: '#3B82F6',                 // Brand accent
}
```

### Files

| File | Purpose |
|------|---------|
| `src/components/gravity/CourtPin.tsx` | Avatar rendering |
| `src/screens/gravity/GravityMapScreen.tsx` | Interaction handling |
| `src/types/court.ts` | Court/session types |

---

## One-Line Summary

> **"Avatars are presence signals, not identity. They must be readable, tappable, calm, and never compete with the map."**
