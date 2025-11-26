# OAuth Sign-In Setup Guide

This guide covers setting up Google Sign-In and Apple Sign-In for the Picklebean Mobile app.

---

## Google Sign-In Setup

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** sign-in provider
5. Note the **Web client ID** (you'll need this)

### 2. Get the Web Client ID

From Firebase Console:
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Find the Web app configuration
4. Copy the **Web client ID**

Or from `google-services.json` (Android):
```json
{
  "client": [
    {
      "oauth_client": [
        {
          "client_id": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
          "client_type": 3
        }
      ]
    }
  ]
}
```

### 3. Add to Environment Variables

Add to `.env.development` and `.env.production`:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

### 4. Android Configuration

The app already has the Google Sign-In dependency installed:
```json
"@react-native-google-signin/google-signin": "^16.0.0"
```

Build and test on an Android device or emulator with Google Play Services.

### 5. iOS Configuration (if using Xcode)

For native iOS builds via Xcode:

1. Open `ios/PicklebeanMobile.xcworkspace` in Xcode
2. Select your project in the navigator
3. Go to **Info** tab
4. Add a new **URL Type**:
   - Identifier: `com.googleusercontent.apps.YOUR_CLIENT_ID`
   - URL Schemes: Reversed client ID (e.g., `com.googleusercontent.apps.123456789`)

---

## Apple Sign-In Setup

### 1. Apple Developer Account

**Requirements:**
- Enrolled in Apple Developer Program ($99/year)
- App configured in App Store Connect

### 2. Enable Apple Sign-In Capability

In Xcode:
1. Select your project
2. Select your target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **Sign in with Apple**

### 3. Firebase Console Configuration

1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Apple** sign-in provider
3. Configure Service ID (optional for enhanced features)

### 4. App Configuration

The app already has the Apple Authentication dependency installed:
```json
"expo-apple-authentication": "^7.x.x"
```

### 5. Testing

Apple Sign-In only works:
- On physical iOS devices (iOS 13+)
- Not in simulators
- Not on Android

---

## Initialize Google Sign-In

The app automatically configures Google Sign-In when needed. Configuration happens in `src/lib/oauth.ts`:

```typescript
import { configureGoogleSignIn } from '@/lib/oauth';

// Called automatically on first Google Sign-In attempt
configureGoogleSignIn();
```

---

## Usage in App

### Google Sign-In
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signInWithGoogle } = useAuth();

await signInWithGoogle();
```

### Apple Sign-In
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signInWithApple } = useAuth();

await signInWithApple();
```

---

## Testing OAuth Sign-In

### Google Sign-In Testing

**Android:**
1. Build the app for Android
2. Install on device/emulator with Google Play Services
3. Tap "Continue with Google"
4. Select Google account
5. Approve permissions

**iOS:**
1. Build via Xcode
2. Run on physical iOS device
3. Tap "Continue with Google"
4. Sign in with Google account
5. Approve permissions

### Apple Sign-In Testing

**iOS Only:**
1. Build via Xcode
2. Run on physical iOS device (iOS 13+)
3. Tap "Continue with Apple"
4. Authenticate with Face ID/Touch ID or password
5. Choose to share/hide email
6. Confirm

---

## Troubleshooting

### Google Sign-In Errors

**"Developer Error"**
- Ensure Web Client ID is correct in environment variables
- Check SHA-1 certificate fingerprint in Firebase (Android)
- Verify package name matches Firebase configuration

**"Sign in cancelled"**
- User cancelled the sign-in flow (not an error)

**"Play Services not available"**
- Update Google Play Services on device
- Use device with Google Play Services (not all emulators)

### Apple Sign-In Errors

**"Not available on this device"**
- iOS 13+ required
- Only works on physical devices
- Check capability is enabled in Xcode

**"Cancelled"**
- User cancelled authentication (not an error)

---

## Security Considerations

1. **Never commit** Web Client ID or OAuth secrets to git
2. **Use environment variables** for all sensitive configuration
3. **Validate tokens** server-side when possible
4. **OAuth users** are automatically marked as verified (`isVerified: true`)
5. **Set appropriate status** for OAuth users (currently `approved`)

---

## User Flow

### First-Time OAuth Users

1. User taps "Continue with Google/Apple"
2. Completes OAuth flow
3. App receives user info (name, email, photo)
4. Creates Firestore user document with:
   - Email from OAuth provider
   - Display name from OAuth provider
   - Photo URL from OAuth provider
   - Username derived from email
   - Status: `approved` (auto-verified)
   - Default rankings: 1000 for all categories

### Returning OAuth Users

1. User taps "Continue with Google/Apple"
2. Firebase recognizes existing account
3. Signs user in
4. Existing Firestore data preserved

---

## Production Checklist

- [ ] Web Client ID added to environment variables
- [ ] Google Sign-In tested on Android
- [ ] Apple Sign-In capability enabled in Xcode
- [ ] Apple Sign-In tested on iOS 13+ device
- [ ] OAuth provider enabled in Firebase Console
- [ ] User creation flow tested
- [ ] Returning user flow tested
- [ ] Error handling tested
- [ ] Environment variables documented for team

---

## Additional Resources

- [Google Sign-In React Native](https://github.com/react-native-google-signin/google-signin)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Apple Sign In Guidelines](https://developer.apple.com/sign-in-with-apple/)
