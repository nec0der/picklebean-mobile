# UX & Design Guidelines

## Core UX Principles

### 1. Think Like the User
- Always put yourself in the user's shoes
- Consider their mental model and expectations
- Design for the 80% use case, not edge cases
- Test flows mentally before implementing

### 2. Cognitive Load Management
- **Less is more** - Remove everything that doesn't serve a purpose
- One primary action per screen
- Progressive disclosure - Show only what's needed when needed
- Avoid redundancy - Don't repeat information unnecessarily

### 3. Clear Visual Hierarchy
- Most important element should be most prominent
- Use size, color, and spacing to guide attention
- Group related elements together
- Consistent spacing creates rhythm

---

## Onboarding Flow Pattern

**Always follow this order:**

1. **Greet** - Make it personal and welcoming
2. **Orient** - Explain what this is/where they are
3. **Educate** - Show how it works  
4. **Activate** - Call to action

```typescript
// ✅ CORRECT: Logical flow
<Header>Hi, {Name}! 👋</Header>
<Subtext>Welcome to App</Subtext>
<ValueProp>What this app does...</ValueProp>
<HowItWorks>Step 1, 2, 3...</HowItWorks>
<CTA>Get Started</CTA>

// ❌ INCORRECT: CTA before education
<Header>Hi!</Header>
<CTA>Get Started</CTA>  // User doesn't know what they're starting
<HowItWorks>...</HowItWorks>
```

---

## Mobile UX Best Practices

### Touch Targets
- Minimum 44x44pt for tap targets
- Add padding around buttons
- Consider thumb zones (bottom easier to reach)

### Content Structure
- F-pattern reading (top-left to bottom-right)
- Most important content above the fold
- Short paragraphs (2-3 lines max on mobile)
- Use bullets over paragraphs

### Action Buttons
- Primary action: Bold, high contrast
- Secondary actions: Subtle
- Destructive actions: Red with confirmation
- Place primary action at bottom (easy thumb reach)

---

## Information Architecture

### Card Usage
- Use cards to group related content
- Don't overuse - causes visual clutter
- Not everything needs a card
- Consider: Is this a distinct unit of information?

### White Space
- Essential for breathing room
- More white space = more premium feel
- Use consistent spacing scale (4, 8, 16, 24, 32px)
- Don't be afraid of empty space

### Typography Hierarchy
```
Heading 1: 24-32px, bold (page title)
Heading 2: 18-20px, bold (section title)
Body: 14-16px, regular/medium (content)
Caption: 12px, regular (metadata)
```

---

## Dashboard Specific Rules

### New User Dashboard
**Goal:** Get them to play their first game

**Flow:**
1. Personal greeting
2. Brief value proposition (1 sentence)
3. How it works (3 steps max)
4. Single clear CTA

**Don't:**
- Overwhelm with stats they don't have yet
- Show empty states
- Have multiple CTAs competing
- Repeat the same message

### Returning User Dashboard  
**Goal:** Show progress and quick actions

**Priority order:**
1. Key stats (visible without scrolling)
2. Recent activity (last 3)
3. Quick actions

---

## Color Psychology

- **Green**: Go, positive, success, safe action
- **Blue**: Trust, calm, informational
- **Red**: Stop, error, destructive action
- **Yellow/Orange**: Warning, attention needed
- **Gray**: Subtle, secondary, disabled

---

## Common UX Mistakes to Avoid

❌ **Redundant messaging** - Saying the same thing twice  
❌ **Premature CTA** - Action before explanation  
❌ **Too many choices** - Paradox of choice creates paralysis  
❌ **Inconsistent patterns** - Use same pattern for same action  
❌ **Unclear hierarchy** - Everything looks equally important  
❌ **Missing feedback** - User doesn't know if action worked  
❌ **Tiny tap targets** - Frustrating on mobile  
❌ **Wall of text** - Break it up with headings, bullets  

---

## Decision Framework

Before implementing any UI:

1. **What's the user's goal here?**
2. **What's the ONE thing they should do?**
3. **Have I removed everything unnecessary?**
4. **Is the flow logical and natural?**
5. **Would my grandma understand this?**

If you can't answer these clearly, rethink the design.

---

## Remember

> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."  
> — Antoine de Saint-Exupéry

Focus on clarity, simplicity, and user goals above all else.
