# Session System V1 - LOCKED DESIGN CONTRACT

> **Status:** LOCKED - No changes without explicit approval
> **Core Principle:** Sessions are lightweight intent signals, not event management tools.

---

## One-Line Summary

> "Sessions are lightweight intent signals layered onto courts — not events, not chats, not tools."

---

## What a Session IS (V1)

A session represents:
> "I (or we) plan to play at this court around this time."

| Property | Description |
|----------|-------------|
| Tied to one court | Always at a specific location |
| Has a start time | When it begins |
| Has a duration | How long it lasts (preset only) |
| May be upcoming or active | Auto-transitions based on time |
| No RSVPs required | Just join if you want |

---

## What a Session is NOT (V1 Hard NOs)

❌ Not an event  
❌ Not a chat room  
❌ Not a booking  
❌ Not an organization activity  
❌ Not a skill-based matchmaker  
❌ No invites  
❌ No limits  
❌ No notifications  
❌ No editing after creation  
❌ No ownership transfer  

---

## Session Creation Flow

### Entry Points (ONLY THESE)

| Entry Point | Location |
|-------------|----------|
| Court bottom sheet | "Create session" button |
| Map bottom CTA | "+ Session" (if implemented) |

**No other entry points exist.**

### Create Session Screen (Single Screen)

No multi-step wizard. One screen only.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Court | Pre-filled | Selected court | Read-only, editable via back nav |
| Time | Preset slots | Now / next 30min | "Now", then 30-min increments |
| Duration | Presets only | 60 min | 60, 90, or 120 min |

**Actions:**
- Primary: **Confirm** → Creates session
- Secondary: **Cancel** → Goes back

**Fields that DO NOT exist:**
- Description
- Skill level
- Player limit
- Invite list
- Recurring

---

## Session Lifecycle (Auto-Managed)

### Status Transitions

```
UPCOMING → ACTIVE → ENDED
```

| Transition | Trigger |
|------------|---------|
| UPCOMING → ACTIVE | `now >= startTime` |
| ACTIVE → ENDED | `now >= startTime + duration` |

### Rules

1. Session **starts automatically** at start time
2. Session **ends automatically** at (start + duration)
3. No host reassignment
4. No manual "end session" button
5. If creator leaves early → session continues until end
6. **Cleanup > control**

---

## Session → Avatar Mapping

When a session exists at a court, the map pin shows:

| State | Visual Change |
|-------|---------------|
| Session exists | Avatar State C — Active Session |
| Indicator | Thin accent-color ring around cluster |

**NO timers, countdowns, or text overlays on map.**

---

## Court Bottom Sheet (Session Awareness)

When opening a court with a session:

| If... | Show Label | Show CTA |
|-------|------------|----------|
| Session active | "Session happening" | "Join session" or "Leave session" |
| Session upcoming | "Session planned" | "Join session" or "Leave session" |
| No session | "No activity right now" | "Create session" |

**DO NOT show:**
- Start/end times prominently
- Participant lists beyond avatars
- Chat (V1)

---

## Data Model

### Session Document

```typescript
interface Session {
  id: string;
  
  // Court reference
  courtId: string;
  courtName: string;  // Denormalized
  
  // Creator
  creatorId: string;
  creatorAvatar?: string;
  
  // Time
  startTime: Timestamp;
  duration: 60 | 90 | 120;  // Minutes
  endTime: Timestamp;       // Computed
  
  // Status (auto-managed)
  status: 'upcoming' | 'active' | 'ended';
  
  // Participants
  participantIds: string[];
  participantAvatars: string[];  // Max 3 for display
  
  // Metadata
  createdAt: Timestamp;
}
```

### Duration Options

| Value | Label |
|-------|-------|
| 60 | 1 hour |
| 90 | 1.5 hours |
| 120 | 2 hours |

---

## Firestore Rules

```javascript
match /sessions/{sessionId} {
  // Anyone authenticated can read
  allow read: if request.auth != null;
  
  // Anyone authenticated can create
  allow create: if request.auth != null
    && request.resource.data.creatorId == request.auth.uid;
  
  // Only participants can update (join/leave)
  allow update: if request.auth != null
    && (request.auth.uid in resource.data.participantIds
        || request.auth.uid == resource.data.creatorId);
  
  // No delete (sessions end automatically)
  allow delete: if false;
}
```

---

## Files

| File | Purpose |
|------|---------|
| `src/types/session.ts` | Type definitions |
| `src/screens/gravity/CreateSessionScreen.tsx` | Creation UI |
| `src/services/sessionService.ts` | Firestore operations |
| `src/components/gravity/CourtBottomSheet.tsx` | Session awareness |
| `src/components/gravity/CourtPin.tsx` | Session indicator |

---

## Acceptance Criteria

Before shipping, verify:

1. ✅ A user can create a session in **under 5 seconds**
2. ✅ The map still feels **calm and readable**
3. ✅ Sessions are **understandable without explanation**
4. ✅ Removing sessions would **not break the app**

If any of these fail, simplify further.

---

## Technical Constraints

- All session interactions originate from **court context**
- Sessions **never appear as standalone objects**
- Map performance must remain **unchanged**
- No new tabs or screens beyond CreateSessionScreen

---

## Future Considerations (NOT V1)

These may be considered for future versions:

- Session chat (V2?)
- Session invites (V2?)
- Recurring sessions
- Session editing
- Notifications
- Skill filtering

**Do not build any of these in V1.**
