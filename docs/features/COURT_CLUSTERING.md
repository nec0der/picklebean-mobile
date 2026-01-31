# Court Clustering V1 - LOCKED DESIGN CONTRACT

> **Status:** LOCKED - No changes without explicit approval

---

## Core Principle (Non-Negotiable)

**We cluster COURTS, not people.**

Avatars never cluster across courts.

If this rule is broken → the map becomes misleading.

---

## 1. What Gets Clustered

### ✅ YES — Cluster

- **Courts** (pins / presence signals)
- **Only when zoomed out**

### ❌ NO — Never Cluster

- Individual avatars
- Avatar groups from different courts
- Sessions across courts

**Each court remains a single semantic unit.**

---

## 2. Clustering States by Zoom Level

### A. Far Zoom (City / Region)

**Purpose:** Orientation only

| Property | Value |
|----------|-------|
| Visual | Court pins clustered |
| Display | Neutral circular pill with count (e.g. "12") |
| Avatars | None |
| Session indicators | None |

**Interaction:**
- Tap cluster → Zoom in
- No bottom sheet

**Answers:** "Are there courts here at all?"

---

### B. Mid Zoom (Neighborhood) — CRITICAL TRANSITION

**Purpose:** Discovery

**Behavior:**
- Court clusters dissolve into individual courts
- Courts may show: Pin OR avatar presence (if activity exists)

**Rule:**
> If two courts are visually too close: Prefer pins, not avatars.
> Avatars appear only when legible.

This prevents overlapping avatar hit targets.

---

### C. Close Zoom (Court Area)

**Purpose:** Decision-making

**Behavior:**
- No clustering
- One court = one presence signal
- Avatars fully visible
- Stable size (no scaling)

**Fallback:**
> If courts are still too close at this zoom: Show pins only. Presence moves to bottom sheet.

This is a **safety valve**, not a failure.

---

## 3. Cluster → Avatar Transition Rule (VERY IMPORTANT)

**Explicit Rule:**

> Avatars are a replacement for pins, not an overlay.

A court is either:
- **A pin** (inactive, far zoom, or density fallback)
- OR **An avatar presence signal** (active, close zoom)

**Never both.**

This avoids visual noise and cognitive overload.

---

## 4. Density Fallback Rule (Edge Case Protection)

If ANY of the following occur:
- Hit targets overlap
- Avatars become ambiguous
- Users mis-tap frequently

**Immediately fallback to:**
- Neutral court pin
- Presence shown only in bottom sheet

**Design Mantra:**
> "When density increases, reduce information — never add."

---

## 5. Why We Do NOT Cluster Avatars

**Philosophically important:**

If you cluster avatars across courts, you destroy:
- Spatial truth
- Decision confidence
- Trust

Users need to know:
> "People are **here**, not vaguely nearby."

Apple Maps, Google Maps, Airbnb all follow this rule.

---

## 6. Implementation Notes

### Zoom Level Detection

```typescript
// Delta thresholds (approximate)
const ZOOM_LEVELS = {
  FAR: { latDelta: 0.5 },    // City view - cluster courts
  MID: { latDelta: 0.1 },    // Neighborhood - transition
  CLOSE: { latDelta: 0.02 }, // Court level - full detail
} as const;
```

### Cluster Component (Future)

```typescript
interface CourtClusterProps {
  courtCount: number;
  center: { latitude: number; longitude: number };
  onPress: () => void; // Zoom in
}
```

### Files to Create (Phase 2)

| File | Purpose |
|------|---------|
| `src/components/gravity/CourtCluster.tsx` | Cluster pill component |
| `src/hooks/gravity/useMapZoom.ts` | Zoom level detection |
| `src/lib/clustering.ts` | Clustering algorithm |

---

## 7. One-Line Rule for Engineering

> "Cluster courts when zoomed out. Replace pins with avatars when zoomed in. Never cluster avatars across courts."

If they remember only this, they will implement it correctly.

---

## Testing Checklist (Phase 2)

- [ ] Far zoom shows court clusters with count
- [ ] Mid zoom transitions clusters → individual courts
- [ ] Close zoom shows full avatar detail
- [ ] No avatar clustering across different courts
- [ ] Density fallback works when courts overlap
- [ ] Tap on cluster zooms in smoothly
