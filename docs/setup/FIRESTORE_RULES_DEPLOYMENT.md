# Firestore Security Rules Deployment

## Overview

The `firestore.rules` file defines security rules for your Firestore database. These rules control who can read and write data in your collections.

## Important: You Must Deploy These Rules

The `firestore.rules` file in your project is **NOT automatically deployed** to Firebase. You must manually deploy it to Firebase using one of the methods below.

---

## Deployment Methods

### Method 1: Firebase Console (Easiest)

1. **Go to Firebase Console**
   - Open https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Rules**
   - Click "Firestore Database" in the left sidebar
   - Click the "Rules" tab at the top

3. **Copy and Paste Rules**
   - Open your local `firestore.rules` file
   - Copy the entire contents
   - Paste into the Firebase Console editor
   - Click "Publish" button

**⏱️ Time:** 2-3 minutes  
**✅ Best for:** Quick updates, one-time deployments

---

### Method 2: Firebase CLI (Recommended for Teams)

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (first time only)
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Accept default firestore.rules filename
   - DON'T overwrite existing files

4. **Deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

**⏱️ Time:** 5 minutes (first time), 30 seconds (subsequent)  
**✅ Best for:** Teams, CI/CD pipelines, version control

---

## What These Rules Allow

### Users Collection
- ✅ **Unauthenticated users** can query for username existence (for signup)
- ✅ **Authenticated users** can read all user profiles
- ✅ **Users** can create/update/delete their own document
- ❌ **Cannot** access without authentication (except username checks)

### Lobbies Collection
- ✅ **Anyone** can read lobbies (for joining games)
- ✅ **Authenticated users** can create lobbies
- ✅ **Host or participants** can update lobby
- ✅ **Host** can delete lobby

### Matches Collection
- ✅ **Authenticated users** can read all matches
- ✅ **Authenticated users** can create matches
- ✅ **Players in match** can update (for confirmations)

---

## Security Considerations

### Why Allow Unauthenticated Username Checks?

**Question:** Isn't it insecure to allow unauthenticated queries?

**Answer:** No, because:
1. Users can only check if a username exists (boolean)
2. They cannot read full user documents or personal data
3. This is required for signup flow (user isn't authenticated yet)
4. Similar to "email already exists" checks on most platforms

### What Data is Protected?

Even with `allow list: if true` on users collection:
- Full user documents require auth (`allow get: if request.auth != null`)
- Queries only return document IDs and matched fields
- Personal data (email, phone, etc.) is not exposed in queries
- Only the username field is queryable for availability

---

## Verifying Rules are Deployed

### Check in Firebase Console
1. Go to Firestore Database → Rules tab
2. You should see your rules with a "Published" timestamp
3. Rules should match your local `firestore.rules` file

### Test Username Availability
1. Try signing up with a new username → Should work
2. Try signing up with an existing username → Should show "Username already taken"
3. No "permission denied" errors should occur

---

## Common Issues

### Issue: "Missing or insufficient permissions"

**Cause:** Rules haven't been deployed yet  
**Solution:** Deploy rules using Method 1 or 2 above

### Issue: Rules deployed but still getting errors

**Cause:** Firebase Rules cache  
**Solution:** 
1. Wait 1-2 minutes for rules to propagate
2. Restart your app
3. Clear app data if needed

### Issue: Can't deploy via CLI

**Cause:** Not logged in or wrong project  
**Solution:**
```bash
firebase login
firebase use --add  # Select correct project
firebase deploy --only firestore:rules
```

---

## Next Steps

1. ✅ Deploy these rules to Firebase (use Method 1 or 2)
2. ✅ Test username availability check in your app
3. ✅ Verify no permission errors during signup
4. 📝 Set reminder to review rules when adding new features

---

## Need Help?

- **Firebase Rules Documentation:** https://firebase.google.com/docs/firestore/security/get-started
- **Testing Rules:** https://firebase.google.com/docs/rules/simulator
- **Best Practices:** https://firebase.google.com/docs/firestore/security/rules-conditions
