# The Sacred Map Screen - Design Specification (LOCKED)

## Purpose

Answer one question instantly:
**"Is it worth going to play right now?"**

Not: how to organize, how to chat, how to manage.
Only **situational awareness**.

---

## Screen Structure

```
┌────────────────────────────────┐
│  Near Schaumburg        🔍      │  ← soft top bar (10%)
├────────────────────────────────┤
│                                │
│                                │
│            MAP                 │
│     (courts + activity)        │  ← dominant (90%)
│                                │
│                                │
│                                │
│                                │
├────────────────────────────────┤
│  [ I'm here ]     [ + Session ] │  ← floating action bar
└────────────────────────────────┘
```

---

## Design Tokens (LOCKED)

### Spacing Scale
| Name | Value |
|------|-------|
| MICRO | 4px |
| TIGHT | 8px |
| DEFAULT | 16px |
| RELAXED | 24px |
| SECTION | 32px |

### Typography
| Use | Size | Weight |
|-----|------|--------|
| Screen title | 20-22 | Semibold |
| Primary text | 16 | Regular |
| Secondary text | 14 | Regular |
| Meta / hint | 12 | Regular |

**Rules:**
- No text smaller than 12px
- No more than 2 weights per screen

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| PRIMARY | #3B82F6 | Blue - actions |
| ACCENT | #10B981 | Green - activity/presence |
| NEUTRAL | #6B7280 | Gray - inactive |
| SURFACE | rgba(255,255,255,0.85) | Translucent surfaces |

---

## Component Specifications

### Top Bar
- Height: 44-48px
- Background: Translucent blur (map visible underneath)
- Content: Location label + Search icon only
- **Forbidden:** Filters, toggles, profile avatar

### Map Pins
Three visual states only:

| State | Visual |
|-------|--------|
| Inactive | Gray dot, no motion |
| Active | Soft pulse (1.5-2s cycle) |
| Session | Avatar cluster |

**Rules:**
- Same size pins
- State shown via motion/glow, not shape
- NO numbers on pins
- NO text labels

### Floating Action Bar
- Two equal buttons: "I'm here" / "+ Session"
- Always visible
- Slight elevation (shadow)
- Rounded container (16px radius)

### Button Interactions
- Press → scale down (98%)
- Release → instant feedback
- **No confirmation dialogs**

### Court Preview Sheet
- Triggered by tapping a pin
- Swipe-dismissible
- Never covers full screen
- Content order: Name → Status → Sessions → Actions
- Actions always visible

---

## Interaction Rules

1. **One gesture = one result**
2. No long presses
3. No hidden gestures
4. No mode switches
5. Map must feel predictable and calm

---

## Motion Rules

### Allowed
- Slow pulse on activity (1.5-2s)
- Gentle fade when sheet appears
- Subtle map focus on tap

### Forbidden
- Bounce
- Zoom jumps
- Shaking
- Flashy animations

> Motion should feel like breathing, not signaling.

---

## Language Rules

### Allowed Words
- "I'm here"
- "Join"
- "Create session"
- "Active now"

### Forbidden Words
- "Reserve"
- "Book"
- "Claim"
- "Host"

> Language must never imply ownership.

---

## What Must NEVER Appear

- [ ] Guild controls
- [ ] Chat
- [ ] Notifications
- [ ] Calendar grids
- [ ] Stats
- [ ] Ratings
- [ ] Admin tools
- [ ] Monetization prompts
- [ ] Numbers on pins
- [ ] Exclamation points

---

## The Sacred Test

Before adding anything, ask:

1. Does this reduce uncertainty at a glance?
2. Does this respect physical reality?
3. Would Airbnb or Apple Maps show this?

**If any answer is no, don't add it.**

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/screens/gravity/GravityMapScreen.tsx` | Main map screen |
| `src/components/gravity/CourtPreviewSheet.tsx` | Court bottom sheet |
| `src/navigation/tabs/GravityTabNavigator.tsx` | Tab navigation |
| `src/config/product.ts` | Product flag (ELO vs GRAVITY) |

---

## How to Run Gravity Product

```bash
# Edit .env.development
EXPO_PUBLIC_PRODUCT=GRAVITY

# Then start
npx expo start
```

---

## Visual North Star

> Feels like Airbnb planning a trip - but lighter, faster, and more local.

**Not:**
- Google Maps density
- Strava intensity
- Club management software

---

*This specification is LOCKED for V1. Any changes require explicit approval.*
