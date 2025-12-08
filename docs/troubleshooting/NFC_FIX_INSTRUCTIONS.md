# NFC Fix - Rebuild Instructions

## Problem
`isSupported()` was returning `false` on iPhone 13 Pro Max because Info.plist was missing required NFC configuration keys.

## What Was Fixed

Added two critical keys to `ios/PicklebeanMobile/Info.plist`:

1. **NFCReaderUsageDescription** - Privacy string explaining why app needs NFC
2. **com.apple.developer.nfc.readersession.formats** - Array specifying NDEF format

## How to Apply the Fix

### Option 1: Clean Rebuild in Xcode (RECOMMENDED)

1. **Open Xcode:**
   ```bash
   open ios/PicklebeanMobile.xcworkspace
   ```

2. **Clean Build Folder:**
   - In Xcode menu: `Product` → `Clean Build Folder` (Shift + Cmd + K)
   - Wait for it to complete

3. **Delete Derived Data:**
   - In Xcode menu: `Window` → `Organizer`
   - Select "Projects" tab
   - Find "PicklebeanMobile"
   - Click "Delete Derived Data"
   - Confirm deletion

4. **Delete App from Device:**
   - On your iPhone, **completely delete** the Picklebean app
   - This ensures the old Info.plist is removed

5. **Rebuild and Run:**
   - In Xcode, select your physical device
   - Click Run (Cmd + R)
   - Wait for build to complete and app to install

### Option 2: Command Line Clean Build

```bash
# Clean everything
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/PicklebeanMobile-*
cd ..

# Delete from device (manually)
# Then rebuild
npm run ios:dev
```

## After Rebuild

1. **Open the app on your physical device**
2. **Navigate to Profile → Program Paddle**
3. **Check the console logs** - you should now see:
   ```
   🔷 [NFC Writer] isSupported result: true
   ```
4. **Tap "Start Writing"** - should no longer show "NFC Not Supported"
5. **Test the full flow** - hold phone to NFC tag

## Verification

When NFC is properly configured, the logs should show:
```
🔷 [NFC Writer] Starting initialization...
🔷 [NFC Writer] Checking isSupported...
🔷 [NFC Writer] isSupported result: true  ← Should be TRUE now
🔷 [NFC Writer] Calling NfcManager.start()...
✅ [NFC Writer] Initialization complete - NFC Manager started
```

## Common Issues

### Still shows "isSupported: false"
- You didn't do a clean rebuild
- App wasn't deleted from device before reinstalling
- Check if Info.plist changes are actually in the built app

### How to verify Info.plist is correct
```bash
cat ios/PicklebeanMobile/Info.plist | grep -A 3 "NFCReader"
```

Should show:
```xml
<key>NFCReaderUsageDescription</key>
<string>We need NFC to read paddle tags and program your paddle with your profile</string>
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
```

## What Changed

**Before:**
```xml
<key>NFCReaderUsageDescription</key>
<string></string>  <!-- Empty! -->
<!-- Missing: com.apple.developer.nfc.readersession.formats -->
```

**After:**
```xml
<key>NFCReaderUsageDescription</key>
<string>We need NFC to read paddle tags and program your paddle with your profile</string>
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
	<string>NDEF</string>
</array>
```

---

## Next Steps After Fix Works

Once NFC is working:
1. Test reading NFC tags (if you have any programmed)
2. Test writing to NFC tags (with blank writable tags)
3. Test the full "Tap to Play" flow
4. Remove debug logging (optional - but keep for now)

## Reference

- Apple Docs: https://developer.apple.com/documentation/corenfc
- react-native-nfc-manager: https://github.com/revtel/react-native-nfc-manager
