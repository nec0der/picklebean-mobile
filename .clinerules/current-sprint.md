# Current Sprint: Initial Setup & Foundation

## Sprint Goal

Set up the React Native/Expo project foundation and build core infrastructure while waiting for EAS enrollment approval.

---

## Priority Focus (This Sprint)

### 1. Infrastructure Setup
- Configure NativeWind and base styling system
- Set up project folder structure
- Configure Firebase with Web SDK  
- Set up TypeScript paths and configurations

### 2. Core Architecture
- Build navigation structure (Auth + Main stack)
- Create Context API providers (Auth, Lobby, Game)
- Develop custom hooks library foundation

### 3. Base UI Components
- Create reusable base components (Button, Card, Input, etc.)
- Build common components (LoadingSpinner, ErrorMessage, etc.)
- Establish component patterns and conventions

### 4. Authentication Flow
- Implement email/password authentication (Firebase Web SDK)
- Create login and onboarding screens
- Build protected route navigation logic

---

## Temporary Rules for This Sprint

### Working with Limitations

Since **EAS enrollment is pending**:
- ✅ Use Firebase **Web SDK** (not native modules)
- ✅ Implement **email/password auth** (skip Google Sign-In for now)
- ✅ Test with **Expo Go** (no custom dev builds yet)
- ✅ Focus on **UI/UX** and **navigation flow**
- ✅ Build **screen layouts** without full backend integration

### What to Skip (For Now)

- ❌ Google Sign-In implementation
- ❌ Push notifications
- ❌ Native Firebase SDK features
- ❌ Custom native modules
- ❌ Production builds

---

## Definition of Done

This sprint is complete when:

- [ ] NativeWind configured and working
- [ ] All base UI components created
- [ ] Navigation structure implemented
- [ ] Firebase Web SDK integrated
- [ ] Email/password authentication working
- [ ] Basic CRUD operations functional
- [ ] All screens have UI mockups
- [ ] App runs smoothly in Expo Go
- [ ] Code follows all style guidelines
- [ ] No console errors or warnings

---

## Next Sprint Preview

Once **EAS is approved**:
1. Switch to native Firebase SDK
2. Implement Google Sign-In
3. Add push notifications
4. Create development builds
5. Test on physical devices
6. Optimize performance
7. Prepare for production deployment

---

## Development Workflow

### Daily Checklist
- [ ] Pull latest changes
- [ ] Run Expo Go on device/simulator
- [ ] Work on assigned tasks
- [ ] Test changes thoroughly
- [ ] Commit with proper message format
- [ ] Update task progress

### Testing on Expo Go
```bash
cd /Users/niazemiluulu/Code/picklebean-mobile
npx expo start
```
Then scan QR code with Expo Go app.

---

## Known Limitations

### Web SDK vs Native SDK

**Current (Web SDK)**:
- ✅ Auth with email/password
- ✅ Firestore queries
- ✅ Storage uploads  
- ✅ Real-time listeners
- ❌ Google Sign-In
- ❌ Push notifications
- ❌ Some native optimizations

**After EAS (Native SDK)**:
- ✅ All above features
- ✅ Google Sign-In
- ✅ Push notifications
- ✅ Better performance
- ✅ Full native integration

---

## Code Quality Reminders

Even during rapid development:
- Type everything explicitly
- Use proper error handling
- Clean up all listeners
- Follow naming conventions
- No console.logs in commits
- Test on both iOS and Android

---

## Sprint Timeline

**Week 1**: Setup and infrastructure
**Week 2**: Core features and screens
**Week 3**: Integration and testing

*Note: Timeline may extend while waiting for EAS approval*

---

## Questions or Issues?

If you encounter blockers or have questions about implementation:
1. Check relevant rules in `.clinerules/` folder
2. Review existing patterns in web app
3. Test approach in Expo Go before full implementation
4. Document decisions for future reference
