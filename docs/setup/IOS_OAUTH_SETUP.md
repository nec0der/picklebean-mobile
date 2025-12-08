# iOS Google OAuth Setup Guide

## Current Status
✅ Bundle Identifier added to app.json: `com.niiazemil.picklebeanmobile`

---

## Step-by-Step: Register iOS App in Firebase

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/

### 2. Select Your Project
Choose: **picklebean-ranking-native-app** (DEV project)

### 3. Go to Project Settings
- Click the ⚙️ **Settings** gear icon (top left)
- Select **Project settings**

### 4. Add iOS App
- Scroll down to **"Your apps"** section
- Click **"Add app"** or the **iOS** icon (📱)

### 5. Register iOS App with These Details

Fill in the registration form:

**Apple bundle ID:** (Required)
```
com.niiazemil.picklebeanmobile
```

**App nickname:** (Optional but recommended)
```
Picklebean Mobile iOS
```

**App Store ID:** (Optional - leave blank for now)

Click **"Register app"**

### 6. Download GoogleService-Info.plist (Optional)
Firebase will offer to download `GoogleService-Info.plist`
- You can **skip this download** for now
- We'll use the iOS Client ID directly instead

Click **"Next"** → **"Next"** → **"Continue to console"**

### 7. Find Your iOS Client ID

After registration:

**Option A: From the Registration Page**
- Look for a section showing client IDs
- Copy the **iOS Client ID** (format: `xxxxx-xxxxx.apps.googleusercontent.com`)

**Option B: From Project Settings**
- Go back to **Project Settings**
- Scroll to **"Your apps"** section
- Find your iOS app (Picklebean Mobile iOS)
- Look for **"Client ID"** under the iOS app details
- Copy the value (format: `xxxxx-xxxxx.apps.googleusercontent.com`)

### 8. Provide the iOS Client ID
Once you have it, paste it here or provide it to me so I can update the code.

---

## For Production (Later)

You'll need to repeat these steps for your **production** Firebase project:
- Project: `picklebean-ranking-app`
- Same Bundle ID: `com.niiazemil.picklebeanmobile`
- Get the production iOS Client ID

---

## What Happens Next

Once you provide the iOS Client ID, I will:
1. Add it to `.env.development` and `.env.production`
2. Update `src/lib/oauth.ts` to use it
3. Google Sign-In will work on both iOS and Android! 🎉

---

## Troubleshooting

**Can't find iOS Client ID?**
- Make sure you completed the iOS app registration
- Look under Project Settings → Your apps → iOS app
- The Client ID should be visible in the app details

**Need to see the Client ID again?**
- Firebase Console → Project Settings
- Scroll to "Your apps" → Find iOS app
- Click on the app name to see details including Client ID

**Wrong Bundle ID?**
- You can delete and re-register the iOS app in Firebase
- Or update the Bundle ID in Firebase settings
