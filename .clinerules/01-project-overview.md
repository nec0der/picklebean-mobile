# Project Overview & Core Principles

## Project Context

**Project Name:** Picklebean Mobile  
**Type:** React Native mobile application  
**Framework:** Expo (managed workflow)  
**Language:** TypeScript (strict mode)  
**Styling:** NativeWind (Tailwind CSS for React Native)  
**Backend:** Firebase (Auth, Firestore, Storage, Analytics)  
**State Management:** React Context API  
**Target Platforms:** iOS and Android

This is a **professional production application** - maintain enterprise-level code quality at all times.

---

## Core Development Principles

### 1. Type Safety First
- Everything must be strictly typed
- No `any` types except when absolutely necessary with proper justification
- TypeScript strict mode enabled at all times
- Explicit return types for all functions

### 2. Performance Matters
- Always consider re-render optimization
- Memory management is critical on mobile devices
- Monitor and optimize bundle size
- Use proper memoization techniques

### 3. Maintainability
- Code should be self-documenting
- Follow DRY (Don't Repeat Yourself) principles
- Write easily testable code
- Components should have single responsibility

### 4. Mobile-First Development
- Consider touch interactions (not just clicks)
- Plan for offline scenarios
- Account for platform differences (iOS vs Android)
- Optimize for various screen sizes and safe areas
- Battery and data usage considerations

### 5. Security
- Never expose sensitive data in code
- Always validate user inputs
- Follow Firebase security best practices
- Use environment variables for configuration
- Implement proper authentication flows

---

## Code Quality Standards

All code must meet these standards before review:

- ✅ Pass TypeScript strict mode compilation
- ✅ Follow project naming conventions
- ✅ Include comprehensive error handling
- ✅ Be performance-optimized
- ✅ Include proper documentation
- ✅ Have appropriate test coverage
- ✅ Work on both iOS and Android

---

## Development Workflow

### Before Writing Code
1. Understand the requirements fully
2. Check existing patterns in the codebase
3. Consider performance implications
4. Plan for error scenarios

### While Writing Code
1. Type everything explicitly
2. Follow established patterns
3. Write self-documenting code
4. Consider reusability

### Before Committing
1. Test on both platforms when possible
2. Verify no console.logs remain
3. Check for proper error handling
4. Ensure all dependencies in useEffect
5. Validate types are correct

---

## When in Doubt

1. **Type Everything**: If unsure about a type, make it explicit
2. **Extract Components**: If a component grows large, break it down
3. **Performance First**: Consider re-renders before implementing
4. **Ask Before Breaking Rules**: Discuss deviations from standards
5. **Test Thoroughly**: On both iOS and Android, various screen sizes

---

## Enforcement

These rules are **requirements, not suggestions**. All code must meet these standards. Code that violates these principles should be refactored before review.
