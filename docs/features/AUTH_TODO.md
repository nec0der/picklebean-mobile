# Authentication TODO - Pending Features

**⚠️ WARNING: DO NOT MODIFY THESE AREAS UNTIL FULLY IMPLEMENTED**

This document tracks authentication features that are **partially implemented** or **not yet started**. These areas should not be modified accidentally while working on other features.

---

## ✅ Completed Auth Features

- [x] Username/password signup flow
- [x] Email/password signup flow  
- [x] Google OAuth signin
- [x] Apple OAuth signin
- [x] Username signin (with Firestore lookup)
- [x] Email signin
- [x] Forgot password flow (sends email)
- [x] Change password (authenticated users)
- [x] Onboarding flow (username, gender, photo)
- [x] OAuth onboarding flow
- [x] Welcome complete celebration screen
- [x] Step indicators in signup flow
- [x] Error handling and user feedback
- [x] Security best practices (username enumeration prevention)

---

## 🚧 Pending Auth Features

### 1. Password Reset Email Template ✏️

**Status:** Not Started  
**Priority:** Medium  
**Location:** Firebase Console → Authentication → Templates

**What Needs to Be Done:**
- Customize the Firebase password reset email template
- Update branding (logo, colors, app name)
- Improve copy and messaging
- Ensure mobile-friendly design
- Test email rendering across email clients

**Current State:**
- Using Firebase default template
- Generic branding
- Works functionally but needs polish

**Resources:**
- Firebase Console: https://console.firebase.google.com/
- Navigate to: Authentication → Templates → Password reset
- [Firebase Email Template Documentation](https://firebase.google.com/docs/auth/custom-email-handler)

---

### 2. Password Reset Landing Page 🔐

**Status:** Not Started  
**Priority:** High  
**Platform:** Web (separate from mobile app)

**What Needs to Be Done:**
- Create a web page to handle Firebase action codes
- Parse `mode` and `oobCode` from URL query parameters
- Verify the reset code is valid
- Allow user to enter new password
- Show success/error states
- Redirect or provide next steps after reset
- Match Picklebean branding

**Technical Requirements:**
```typescript
// URL format from Firebase email:
// https://yourdomain.com/__/auth/action?mode=resetPassword&oobCode=ABC123

// Need to:
1. Parse query parameters
2. Verify code with Firebase: verifyPasswordResetCode(auth, oobCode)
3. Show password input form
4. Submit: confirmPasswordReset(auth, oobCode, newPassword)
5. Show success message
```

**Files to Create:**
- New web project or page (Next.js, React, vanilla HTML)
- Configure Firebase hosting or custom domain
- Update Firebase action URL in Firebase Console

**References:**
- [Firebase Custom Email Handler](https://firebase.google.com/docs/auth/custom-email-handler)
- Current mobile flow: `src/screens/auth/ForgotPasswordScreen.tsx`

---

### 3. Email Verification 📧

**Status:** Not Started  
**Priority:** High  

**What Needs to Be Done:**

#### Mobile App Changes:
1. **Send verification email after signup**
   - Add `sendEmailVerification()` call in `AuthContext.tsx`
   - Show prompt to check email
   - Prevent certain actions until verified (optional)

2. **Check verification status**
   - Add `emailVerified` to user state
   - Show "Verify Email" banner if not verified
   - Provide "Resend verification" button

3. **Handle verification state**
   - Refresh auth state after verification
   - Update UI to show verified status
   - Unlock features if gated behind verification

#### Web Landing Page:
- Similar to password reset page
- Handle `mode=verifyEmail&oobCode=ABC123`
- Show success message after verification
- Provide link to open mobile app

**Technical Implementation:**
```typescript
// In AuthContext.tsx after signup:
import { sendEmailVerification } from 'firebase/auth';

await sendEmailVerification(firebaseUser);

// Check status:
const isVerified = firebaseUser.emailVerified;

// Resend:
await sendEmailVerification(auth.currentUser);
```

**Files to Modify:**
- `src/contexts/AuthContext.tsx` - Add verification logic
- `src/types/user.ts` - Add `emailVerified` field
- Create `src/components/common/VerifyEmailBanner.tsx`
- Firebase Console - Configure email verification template

**Considerations:**
- Should verification be required or optional?
- What features need verification? (Game play? Ranked matches?)
- How to handle resend rate limiting?

---

### 4. Email Change Flow 📬

**Status:** Not Started  
**Priority:** Medium

**What Needs to Be Done:**

#### Mobile App Flow:
1. **Email Change Screen**
   - User enters new email
   - Require password confirmation for security
   - Send verification to new email
   - Show "Pending verification" state

2. **Verification Process**
   - Firebase sends verification to new email
   - User clicks link in email
   - Email updated in Firebase Auth
   - Update email in Firestore `users` collection

3. **State Management**
   - Track pending email changes
   - Show both old and new email during transition
   - Cancel pending change option
   - Revert if verification fails/expires

**Technical Implementation:**
```typescript
// Update email (requires recent auth):
import { updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

// 1. Reauthenticate first
const credential = EmailAuthProvider.credential(currentEmail, password);
await reauthenticateWithCredential(auth.currentUser, credential);

// 2. Update email
await updateEmail(auth.currentUser, newEmail);

// 3. Send verification
await sendEmailVerification(auth.currentUser);

// 4. Update Firestore
await updateDoc(doc(firestore, 'users', uid), { email: newEmail });
```

**Files to Create:**
- `src/screens/settings/ChangeEmailScreen.tsx`
- Add route to `navigation/AppNavigator.tsx`

**Files to Modify:**
- `src/contexts/AuthContext.tsx` - Add `updateEmail` function
- `src/screens/SettingsScreen.tsx` - Add "Change Email" option

**Security Considerations:**
- Always require password confirmation
- Rate limit email changes (e.g., once per week)
- Send notification to old email about change
- Consider cooldown period before allowing change

---

## 🎯 Implementation Priority

1. **High Priority:**
   - Password Reset Landing Page (users can't reset password without it)
   - Email Verification (security best practice)

2. **Medium Priority:**
   - Password Reset Email Template (branding/UX improvement)
   - Email Change Flow (user convenience)

---

## 📝 Implementation Notes

### General Guidelines:
- All email-related features should match Picklebean branding
- Maintain consistent error handling patterns
- Log all auth events for debugging
- Test on both iOS and Android (mobile)
- Test across email clients (Gmail, Outlook, Apple Mail)
- Follow security best practices (rate limiting, recent auth requirements)

### Testing Checklist:
- [ ] Test email delivery (inbox, spam folder)
- [ ] Test email rendering on mobile and desktop
- [ ] Test action code expiration handling
- [ ] Test error states and user feedback
- [ ] Test edge cases (expired codes, used codes, invalid codes)
- [ ] Test cross-device scenarios
- [ ] Test security (unauthorized access attempts)

---

## 🔗 Related Files

**Currently Implemented:**
- `src/contexts/AuthContext.tsx` - Core auth logic
- `src/screens/auth/ForgotPasswordScreen.tsx` - Forgot password flow
- `src/screens/settings/ChangePasswordScreen.tsx` - Change password (authenticated)
- `src/lib/authErrors.ts` - Error message mapping
- `src/lib/username.ts` - Username utilities

**Firebase Configuration:**
- `firebase.json` - Firebase project config
- Firebase Console - Email templates and settings

---

## 📚 Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Custom Email Handler](https://firebase.google.com/docs/auth/custom-email-handler)
- [Firebase Email Verification](https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email)
- [React Native Firebase Auth](https://rnfirebase.io/auth/usage)

---

**Last Updated:** January 4, 2026  
**Status:** Sign up and sign in flows complete. Email-related features pending.
