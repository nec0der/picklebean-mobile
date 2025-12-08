# Documentation

This directory contains all project documentation organized by category.

## 📁 Directory Structure

```
docs/
├── setup/              # Initial setup and configuration guides
├── implementation/     # Feature implementation documentation
├── troubleshooting/    # Problem-solving and fix guides
└── features/          # Feature specifications and improvements
```

---

## 📚 Documentation Index

### Setup & Configuration (`/setup`)

**Initial Setup:**
- `OAUTH_SETUP.md` - Google & Apple OAuth configuration
- `IOS_OAUTH_SETUP.md` - iOS-specific OAuth setup steps
- `FIRESTORE_RULES_DEPLOYMENT.md` - Firebase security rules deployment
- `TAB_NAVIGATION_SETUP.md` - Bottom tab navigation configuration

**When to use:** Setting up a new development environment or configuring third-party services.

---

### Implementation Guides (`/implementation`)

**Core Features:**
- `AUTH_IMPLEMENTATION.md` - Authentication system architecture
- `NFC_IMPLEMENTATION.md` - NFC tag reading/writing implementation
- `GAME_FLOW.md` - Game lobby and match flow documentation

**When to use:** Understanding how major features are implemented or adding new features.

---

### Troubleshooting (`/troubleshooting`)

**Common Issues:**
- `DEPENDENCY_FIXES.md` - Dependency conflict resolutions
- `NATIVEWIND_FIX.md` - NativeWind/Tailwind setup fixes
- `WORKLETS_FIX.md` - React Native Reanimated worklet issues
- `NFC_FIX_INSTRUCTIONS.md` - NFC configuration and rebuild guide

**When to use:** Encountering build errors, dependency issues, or feature-specific problems.

---

### Features & Improvements (`/features`)

**Feature Documentation:**
- `PUBLIC_PROFILES.md` - Public profile system design
- `LOGIN_SCREEN_UX_IMPROVEMENTS.md` - Auth screen UX enhancements
- `NFC_WRITING_COMPLETE.md` - NFC writing feature completion
- `SETUP_COMPLETE.md` - Initial project setup completion
- `DECISIONS.md` - Architectural decisions and rationale

**When to use:** Understanding feature requirements, UX decisions, or project milestones.

---

## 🔍 Quick Reference

### Common Tasks

**Setting up OAuth:**
1. Read `setup/OAUTH_SETUP.md`
2. Follow `setup/IOS_OAUTH_SETUP.md` for iOS

**Fixing NFC issues:**
1. Check `troubleshooting/NFC_FIX_INSTRUCTIONS.md`
2. Follow clean rebuild steps

**Understanding authentication:**
1. Read `implementation/AUTH_IMPLEMENTATION.md`
2. Reference `features/LOGIN_SCREEN_UX_IMPROVEMENTS.md`

**Resolving dependency errors:**
1. Check `troubleshooting/DEPENDENCY_FIXES.md`
2. Follow version-specific fixes

---

## 📝 Documentation Standards

When adding new documentation:

1. **Choose the right category:**
   - `setup/` - Configuration and environment setup
   - `implementation/` - How features are built
   - `troubleshooting/` - Solving specific problems
   - `features/` - Feature specs and improvements

2. **Use clear naming:**
   - Descriptive names (e.g., `NFC_IMPLEMENTATION.md`)
   - UPPER_SNAKE_CASE for consistency
   - Include subject in filename

3. **Structure your document:**
   ```markdown
   # Title
   
   ## Problem/Overview
   ## Solution/Implementation
   ## Testing/Verification
   ## References
   ```

4. **Keep it updated:**
   - Update docs when implementations change
   - Mark obsolete sections clearly
   - Include date of last update

---

## 🔗 External Resources

- **Project Repository:** [GitHub](https://github.com/nec0der/picklebean-mobile)
- **React Native Docs:** https://reactnative.dev
- **Expo Docs:** https://docs.expo.dev
- **Firebase Docs:** https://firebase.google.com/docs
- **NativeWind Docs:** https://nativewind.dev

---

## 💡 Contributing

When you solve a problem or implement a feature:

1. Document it in the appropriate category
2. Update this README's index
3. Link related documents
4. Include code examples where helpful

**Good documentation saves time for everyone!**
