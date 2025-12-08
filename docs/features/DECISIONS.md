# Architecture Decision Records

## Purpose

This file documents all major technical decisions made during the development of the Picklebean mobile app. It serves as institutional memory, helping future developers (human or AI) understand why certain choices were made.

## How to Use

**When to add an entry:**
- Major architectural choices
- Technology selections
- Significant design pattern decisions
- Important trade-offs

**When NOT to add an entry:**
- Bug fixes
- Minor refactoring
- Simple feature additions
- Styling tweaks

**End-of-day workflow:**
Ask AI: "Summarize today's architectural decisions for DECISIONS.md"

---

## Template for New Entries

```markdown
## [YYYY-MM-DD] - Brief Decision Title

**Context:**
What situation led to needing this decision?

**Decision:**
What did we decide to do?

**Rationale:**
Why did we make this choice?

**Alternatives Considered:**
- Option A: Why rejected
- Option B: Why rejected

**Consequences:**
- Positive: Benefits we gain
- Negative: Trade-offs we accept

**Status:** Active | Superseded | Deprecated
```

---

# Decision History

## [2024-11-13] - Mobile Framework Selection

**Context:**
Picklebean has a successful React web app using Vite, React Router, Firebase, and TypeScript. Need to create mobile apps (iOS & Android) to expand user base and provide better mobile experience.

**Decision:**
Use React Native with Expo (managed workflow)

**Rationale:**
- Team expertise: Already using React and TypeScript
- Code sharing: Can share business logic, Firebase config, and types with web app
- Development speed: Expo provides excellent DX with hot reload, easy testing
- Cross-platform: Single codebase for iOS and Android
- Future flexibility: Can eject to bare workflow if needed
- Community: Large ecosystem, excellent documentation

**Alternatives Considered:**
- **Flutter:** Rejected - team lacks Dart experience, would require learning new language
- **Native (Swift/Kotlin):** Rejected - 2x development time, separate codebases
- **Capacitor/Ionic:** Rejected - less mature React Native ecosystem, performance concerns
- **React Native CLI (bare):** Rejected - unnecessary complexity for initial development

**Consequences:**
- ✅ Faster time to market
- ✅ Can iterate quickly with Expo Go
- ✅ Leverage existing React knowledge
- ⚠️ Some limitations with native modules (until using EAS)
- ⚠️ Bundle size slightly larger than native

**Status:** Active

---

## [2024-11-13] - Firebase SDK Choice (Temporary)

**Context:**
Need Firebase authentication, Firestore, and Storage. Expo now offers native Firebase support via EAS, but requires enrollment which takes time to approve.

**Decision:**
Use Firebase Web SDK initially, migrate to React Native Firebase (@react-native-firebase) after EAS approval

**Rationale:**
- Can start development immediately
- Web SDK works in Expo Go for testing
- Most features available (auth, Firestore, Storage, real-time listeners)
- Clear migration path once EAS approved
- Web app already uses Web SDK, so familiar patterns

**Alternatives Considered:**
- **Wait for EAS approval:** Rejected - would delay start by unknown time
- **Start with React Native Firebase:** Rejected - requires custom dev build, can't test in Expo Go
- **Use different backend:** Rejected - Firebase already integrated in web app

**Consequences:**
- ✅ Start development today
- ✅ Test easily in Expo Go
- ✅ Reuse Firebase config from web app
- ⚠️ Must implement email/password auth first (no Google Sign-In yet)
- ⚠️ No push notifications initially
- ⚠️ Migration effort later (estimated 1-2 days)
- ⚠️ Slightly worse performance than native SDK

**Migration Plan:**
Once EAS approved:
1. Install @react-native-firebase packages
2. Create custom dev build with EAS
3. Migrate auth, Firestore, Storage implementations
4. Add Google Sign-In
5. Implement push notifications

**Status:** Active (Temporary - will migrate to native Firebase SDK)

---

## [2024-11-13] - Styling System Selection

**Context:**
Need consistent styling system that works well with React Native and provides good developer experience. Web app uses Tailwind CSS classes.

**Decision:**
Use NativeWind (Tailwind CSS for React Native)

**Rationale:**
- Familiar syntax for team already using Tailwind
- Utility-first approach matches web app patterns
- Excellent React Native integration
- Consistent design system across web and mobile
- No need to learn new styling approach

**Alternatives Considered:**
- **StyleSheet (vanilla RN):** Rejected - verbose, no design system
- **Styled Components:** Rejected - different paradigm from web app
- **Tamagui:** Rejected - more complex, unnecessary features
- **React Native Paper:** Rejected - opinionated components, prefer custom UI

**Consequences:**
- ✅ Fast development with familiar syntax
- ✅ Easy to share design tokens
- ✅ Consistent with web app approach
- ⚠️ Small learning curve for RN-specific classes
- ⚠️ Adds dependency to project

**Status:** Active

---

## [2024-11-13] - State Management Strategy

**Context:**
Need global state management for auth, lobby, and game state. Web app uses React Context API successfully.

**Decision:**
Use React Context API for global state management

**Rationale:**
- Already working well in web app
- No external dependencies needed
- Sufficient for app complexity
- Team familiar with pattern
- Easy to understand and maintain

**Alternatives Considered:**
- **Redux Toolkit:** Rejected - overkill for this app's complexity
- **Zustand:** Rejected - unnecessary external dependency
- **MobX:** Rejected - different paradigm, learning curve
- **Recoil:** Rejected - added complexity without clear benefit

**Consequences:**
- ✅ Zero additional dependencies
- ✅ Straightforward implementation
- ✅ Good performance with proper memoization
- ⚠️ Need to be careful with re-renders
- ⚠️ Manual optimization required (useMemo, useCallback)

**Status:** Active

---

## [2024-11-13] - Authentication Strategy

**Context:**
Need user authentication for mobile app. Firebase supports multiple providers but Google Sign-In requires native modules currently unavailable with Web SDK.

**Decision:**
Implement email/password authentication first, add Google Sign-In after EAS approval

**Rationale:**
- Email/password works with Firebase Web SDK
- Can start building auth flow immediately
- Matches minimum viable product requirements
- Social auth can be added incrementally

**Alternatives Considered:**
- **Wait for native SDK:** Rejected - delays all development
- **Phone authentication:** Rejected - costs money, not primary use case
- **Anonymous auth:** Rejected - not sufficient for ranked gameplay

**Consequences:**
- ✅ Can develop and test auth immediately
- ✅ Simplifies initial implementation
- ✅ Lower initial complexity
- ⚠️ Manual email verification required
- ⚠️ Slightly worse UX vs social login
- ⚠️ Will add Google Sign-In in phase 2

**Status:** Active

---

## [2024-11-13] - Navigation Architecture

**Context:**
React Native requires different navigation library than React Router used in web app. Need stack navigation, tab navigation, and modal presentation.

**Decision:**
Use React Navigation v6 (standard for React Native)

**Rationale:**
- Industry standard for React Native
- Excellent documentation and community support
- Supports all needed navigation patterns
- TypeScript support
- Integrates well with Expo

**Alternatives Considered:**
- **React Native Navigation:** Rejected - native dependency, harder setup
- **Expo Router:** Rejected - too new, less mature than React Navigation
- **Custom solution:** Rejected - reinventing the wheel

**Consequences:**
- ✅ Proven, stable solution
- ✅ Great developer experience
- ✅ Good TypeScript support
- ⚠️ Different API than React Router (can't share routing code)
- ⚠️ Learning curve for navigation patterns

**Status:** Active

---

## [2024-11-13] - Build and Testing Strategy

**Context:**
Expo offers two development approaches: Expo Go (development client) and custom development builds with EAS. EAS requires enrollment approval.

**Decision:**
Use Expo Go for initial development, transition to EAS builds once approved

**Rationale:**
- Expo Go available immediately
- Fast iteration during UI development
- No build infrastructure needed initially
- Can test most features without native modules
- Clear upgrade path to EAS

**Alternatives Considered:**
- **Wait for EAS approval:** Rejected - unnecessary delay
- **Use React Native CLI:** Rejected - more complex setup
- **Expo Go only:** Rejected - can't use native Firebase long-term

**Consequences:**
- ✅ Start development today
- ✅ Fast refresh and testing
- ✅ No build configuration needed
- ⚠️ Limited to features in Expo Go SDK
- ⚠️ Can't test native Firebase features yet
- ⚠️ Will need to setup EAS builds later

**Status:** Active (Temporary - will add EAS builds)

---

## [2024-11-13] - Code Organization Structure

**Context:**
Need organized folder structure that scales well and matches React Native best practices while leveraging web app patterns where applicable.

**Decision:**
Feature-based structure with shared utilities and UI components

```
/src
  /components
    /common      # Shared across features
    /ui          # Base design system
    /features    # Feature-specific components
  /screens       # Navigation screens
  /contexts      # Global state
  /hooks         # Custom hooks
  /lib           # Utilities
  /types         # TypeScript types
  /config        # Configuration files
```

**Rationale:**
- Scales well as app grows
- Clear separation of concerns
- Easy to find related code
- Matches industry patterns
- Similar to web app structure

**Alternatives Considered:**
- **Flat structure:** Rejected - doesn't scale
- **Atomic design:** Rejected - overly complex for this app
- **Domain-driven:** Rejected - overkill for current size

**Consequences:**
- ✅ Maintainable and scalable
- ✅ Clear organization
- ✅ Easy onboarding
- ⚠️ Requires discipline to maintain
- ⚠️ Some files may fit multiple categories

**Status:** Active

---

## [2024-11-14] - Firebase Auth Persistence with TypeScript Fix

**Context:**
Firebase Web SDK in React Native appears not to support auth persistence, with `getReactNativePersistence` function seemingly missing. Initial attempts to import it caused TypeScript errors. After investigation, discovered this is a TypeScript configuration issue, not a missing feature.

**Decision:**
Configure TypeScript to use React Native type definitions for Firebase Auth by adding path mapping to `tsconfig.json`. The `getReactNativePersistence` function exists in Firebase Web SDK v10+, but TypeScript defaults to web type definitions.

**Rationale:**
- Firebase Web SDK v10+ includes React Native persistence support
- TypeScript uses web type definitions by default (index.d.ts)
- React Native specific types exist in `index.rn.d.ts` file
- Path mapping tells TypeScript to use RN types instead of web types
- This is a documented solution with 118+ upvotes on Stack Overflow
- No code workarounds or type assertions needed

**Implementation:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@firebase/auth": ["./node_modules/@firebase/auth/dist/index.rn.d.ts"]
    }
  }
}
```

```typescript
// firebase.ts
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```

**Alternatives Considered:**
- **Type casting with `as any`:** Rejected - hacky, loses type safety
- **Custom persistence object:** Rejected - fails Firebase validation
- **Ignoring TypeScript errors:** Rejected - defeats purpose of TypeScript
- **Waiting for native SDK:** Rejected - unnecessary, Web SDK works correctly

**Consequences:**
- ✅ Users stay logged in across app restarts
- ✅ Proper TypeScript support without workarounds
- ✅ Uses official Firebase persistence mechanism
- ✅ AsyncStorage handles token storage
- ✅ Clean, maintainable solution
- ✅ Works with Firebase Web SDK (no native modules needed)
- ✅ Compatible with Expo Go for development
- ⚠️ Requires TypeScript path mapping in tsconfig.json
- ⚠️ Less documented than native SDK approach

**Testing:**
1. Sign in to account
2. Close app completely (force close)
3. Reopen app
4. User should remain authenticated ✅

**Verification:**
✅ **Tested and confirmed working** (November 14, 2024)
- Auth tokens persist across app restarts
- Users stay logged in after force-closing app
- TypeScript recognizes imports without errors
- No runtime errors in Expo Go
- Production-ready implementation

**Migration to Native SDK:**
When migrating to @react-native-firebase later:
1. Remove TypeScript path mapping from tsconfig.json
2. Replace Web SDK imports with native SDK
3. Native SDK uses iOS Keychain/Android KeyStore (even more secure)
4. AsyncStorage package can be removed or kept for other app data

**References:**
- Stack Overflow: "Cannot import getReactNativePersistence in firebase@10.1.0" (118 upvotes)
- GitHub Issue: firebase/firebase-js-sdk TypeScript definitions
- Firebase Auth Persistence Documentation

**Status:** Active (Production-ready solution)

---

## Notes for Future Decisions

**Areas to document as they're decided:**
- Real-time data synchronization patterns
- Offline support strategy
- Analytics implementation
- Error tracking service
- App update strategy
- Testing approach
- Deployment pipeline
- Performance monitoring

**Remember:** Keep entries concise but complete. Focus on "why" not detailed "how".
