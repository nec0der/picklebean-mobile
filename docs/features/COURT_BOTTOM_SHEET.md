# Court Bottom Sheet V1 - LOCKED DESIGN CONTRACT

> **Status:** LOCKED - No changes without explicit approval

---

## Core Philosophy

This bottom sheet answers ONE question:

> "Is this court a good choice for me right now?"

If any UI element does not help answer this → it must not exist.

---

## Information Hierarchy (STRICT ORDER)

### Section 1: Court Identity

**Purpose:** Orientation, not branding.

| Include | Example |
|---------|---------|
| Court name | Grant Park Courts |
| City/neighborhood | Chicago |
| Indoor/Outdoor | Outdoor |

**DO NOT include:**
- ❌ Ratings
- ❌ Reviews
- ❌ Stars
- ❌ Popularity scores
- ❌ Photos (V1)

---

### Section 2: Live Presence (MOST IMPORTANT)

**Purpose:** Answer "what's happening here?"

| Activity State | Text |
|----------------|------|
| Empty | "No activity right now" |
| Presence | "Players here" + "Just arrived" |
| Session | "Session happening" + "Active now" |

**Avatar Row:**
- Max 4 avatars visible
- Same avatars as map pins
- NO numbers ("+3", "5 players") → **FORBIDDEN**

**DO NOT show:**
- ❌ Skill levels
- ❌ Ratings
- ❌ Session titles
- ❌ Court capacity
- ❌ Wait times

> **Presence > Precision**

---

### Section 3: Primary Actions

**MAX 2 BUTTONS:**

| Button | Action |
|--------|--------|
| "I'm here" | Check in, signal presence |
| "Create session" | Opens session creation flow |

**Button rules:**
- Large
- Calm
- Not sticky
- Visually secondary to map

**DO NOT add:**
- ❌ Join queue
- ❌ Reserve court
- ❌ Pay
- ❌ Invite group

---

### Section 4: Near-Future Context (Optional)

**Only show if relevant:**
- Upcoming session later today
- Avatar(s) + time (e.g. "6:30 PM")

**DO NOT add:**
- ❌ Scrolling lists
- ❌ Calendars
- ❌ "View all" links

If empty → do not render this section.

---

## Sheet Behavior

| Gesture | Action |
|---------|--------|
| Swipe down | Dismiss |
| Tap outside | Dismiss |
| Swipe up | Expand (optional, V2) |

**Rules:**
- Half-height initial state
- Rounded top corners
- Map remains visible above
- No snap chaos
- No nested sheets

---

## Content That MUST NEVER Appear (V1 Hard NOs)

❌ Skill levels  
❌ Ratings (ELO, DUPR, self-estimated)  
❌ Popularity scores  
❌ Review stars  
❌ Comment threads  
❌ Court booking / reservation  
❌ Organizer dashboards  
❌ Group management tools  
❌ Guild management tools  
❌ Admin roles  
❌ Notifications inside the sheet  

If it smells like **"management"**, **"moderation"**, or **"optimization"** → it doesn't belong here.

---

## Design Language

### Visual Tone
- Calm
- Airy
- Apple Maps / Airbnb-like restraint
- No heavy dividers
- Soft spacing
- Typography > borders

### Color
- Neutral base
- One accent color max (#3B82F6)
- No semantic color overload

### Motion
- Gentle fade / slide
- No bounce
- No celebration animations

---

## Mental Model

This bottom sheet should feel like:

> "I'm standing nearby and peeking in."

NOT:
- "I'm managing an event"
- "I'm analyzing a venue"
- "I'm planning a tournament"

**The person is always the actor.**  
**The court is the context.**

---

## Success Criteria (5-Second Test)

A new user should be able to:
1. Open the sheet
2. Understand what's happening
3. Decide to go / not go

...in **under 5 seconds**, without reading text blocks.

If they need to think → simplify.

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/components/gravity/CourtBottomSheet.tsx` | Main component |
| `src/screens/gravity/GravityMapScreen.tsx` | Integration |
| `src/types/court.ts` | Court type |

---

## Future Features (DO NOT DESIGN FOR)

- Guilds
- Organizations
- Payments
- Bookings
- Ratings
- Events
- Leaderboards

These may exist later but **must not leak into the UI now**.

---

## Final Instruction

**Minimalism is the feature.**

Design only what is described above.  
Do not add "nice to have" elements.  
Do not anticipate future features visually.
