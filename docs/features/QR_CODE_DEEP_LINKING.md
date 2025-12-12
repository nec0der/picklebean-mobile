# QR Code with Deep Linking - Implementation Complete ✅

## Mobile Side - ✅ COMPLETE

The mobile app now supports:
- ✅ Dynamic QR code generation with web URLs
- ✅ Deep link configuration (picklebean://)
- ✅ Universal Links (iOS) and App Links (Android)
- ✅ Beautiful QR code modal UI
- ✅ Environment-aware URL generation

### What Was Built

1. **Dynamic Configuration** (`src/lib/config.ts`)
   - Auto-detects dev vs production environment
   - Generates lobby URLs: `https://picklebean-ranking-app.web.app/lobby/{CODE}`
   - Helper functions for URL generation

2. **Deep Linking Setup** (`app.json`)
   - Universal Links for iOS
   - App Links for Android
   - Custom URL scheme: `picklebean://`

3. **Navigation Integration** (`App.tsx`)
   - React Navigation linking configuration
   - Handles: `picklebean://lobby/{CODE}`
   - Handles: `https://picklebean-ranking-app.web.app/lobby/{CODE}`

4. **QR Code Modal** (`src/components/features/lobby/QRCodeModal.tsx`)
   - Clean, scannable QR code
   - Room code display
   - User instructions
   - URL reference

5. **LobbyDetailScreen Integration**
   - QR button shows modal
   - Hosts can share lobby via QR

---

## Web Side - 📋 TODO (You'll implement this)

### Implementation Steps

#### 1. Update `src/pages/Lobby.tsx`

Add app detection logic at the top of the component:

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Lobby() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [showDownload, setShowDownload] = useState(false);
  
  useEffect(() => {
    // Detect if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && roomCode) {
      attemptMobileAppOpen(roomCode);
    }
  }, [roomCode]);
  
  function attemptMobileAppOpen(code: string) {
    // Try deep link first
    const deepLink = `picklebean://lobby/${code}`;
    window.location.href = deepLink;
    
    // Fallback after 1.5 seconds (app not installed)
    setTimeout(() => {
      // Check if page is still visible (app didn't open)
      if (!document.hidden) {
        setShowDownload(true);
      }
    }, 1500);
  }
  
  // Rest of your existing lobby code...
  
  return (
    <div>
      {/* Your existing lobby UI */}
      
      {/* Download Prompt (Optional) */}
      {showDownload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h2 className="text-xl font-bold mb-2">Download Picklebean App</h2>
            <p className="text-gray-600 mb-4">
              For the best experience, get our mobile app!
            </p>
            <div className="space-y-2">
              <a
                href="https://apps.apple.com/app/picklebean"
                className="block w-full py-3 bg-black text-white text-center rounded-lg font-semibold"
              >
                App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.niiazemil.picklebeanmobile"
                className="block w-full py-3 bg-green-600 text-white text-center rounded-lg font-semibold"
              >
                Google Play
              </a>
              <button
                onClick={() => setShowDownload(false)}
                className="block w-full py-3 bg-gray-200 text-gray-800 text-center rounded-lg font-semibold"
              >
                Continue on Web
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 2. Deploy to Firebase Hosting

```bash
cd /path/to/picklebean-ranking-app
npm run build
firebase deploy --only hosting
```

---

## How It Works

### User Flow (App Installed)

1. Host creates lobby in mobile app
2. Host clicks QR button → Shows QR code
3. Player scans QR with phone camera
4. Browser opens: `https://picklebean-ranking-app.web.app/lobby/ABCD`
5. Web page detects mobile → Tries `picklebean://lobby/ABCD`
6. **Mobile app opens directly to lobby!** 🎉
7. Player auto-joins lobby

### User Flow (App Not Installed)

1-4. Same as above
5. Web page tries to open app (fails silently)
6. After 1.5s: Shows "Download App" prompt
7. Player can download OR continue on web

---

## Testing

### Test Deep Linking (iOS Simulator)

```bash
# 1. Build and run mobile app
npx expo run:ios

# 2. Test deep link
xcrun simctl openurl booted "picklebean://lobby/TEST123"

# 3. Test universal link
xcrun simctl openurl booted "https://picklebean-ranking-app.web.app/lobby/TEST123"
```

### Test Deep Linking (Android Emulator)

```bash
# 1. Build and run mobile app
npx expo run:android

# 2. Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "picklebean://lobby/TEST123" com.niiazemil.picklebeanmobile

# 3. Test app link
adb shell am start -W -a android.intent.action.VIEW -d "https://picklebean-ranking-app.web.app/lobby/TEST123" com.niiazemil.picklebeanmobile
```

### Test QR Code Flow (Real Device)

1. Create lobby in mobile app
2. Click QR button
3. Use another phone to scan QR
4. Verify:
   - Browser opens web app
   - App opens automatically (if installed)
   - Or shows download prompt (if not installed)

---

## Configuration

### Change Web Domain

Edit `app.json`:

```json
{
  "expo": {
    "extra": {
      "webUrl": "https://your-custom-domain.com"
    },
    "ios": {
      "associatedDomains": [
        "applinks:your-custom-domain.com"
      ]
    },
    "android": {
      "intentFilters": [{
        "data": [{
          "scheme": "https",
          "host": "your-custom-domain.com",
          "pathPrefix": "/lobby"
        }]
      }]
    }
  }
}
```

Then rebuild the app.

---

## Files Modified

### Mobile App

- `src/lib/config.ts` (new)
- `src/components/features/lobby/QRCodeModal.tsx` (new)
- `app.json` (updated)
- `App.tsx` (updated)
- `src/screens/LobbyDetailScreen.tsx` (updated)
- `package.json` (added expo-constants)

### Web App (Your TODO)

- `src/pages/Lobby.tsx` (needs update)

---

## Troubleshooting

### Deep Links Not Working (iOS)

1. Ensure `associatedDomains` is correct in `app.json`
2. Verify domain owns `.well-known/apple-app-site-association` file
3. Rebuild app after config changes
4. Test with `xcrun simctl openurl booted`

### Deep Links Not Working (Android)

1. Ensure `intentFilters` with `autoVerify: true`
2. Verify `pathPrefix` matches your routes
3. Test with `adb shell am start`
4. Check logcat for verification errors

### QR Code Not Showing

1. Check `react-native-qrcode-svg` is installed
2. Verify `expo-constants` is installed
3. Check console for errors

### Web App Not Redirecting

1. Verify mobile detection logic
2. Check browser console for errors
3. Test timeout duration (1.5s)
4. Ensure `window.location.href` assignment works

---

## Next Steps

1. ✅ Mobile implementation complete
2. 📋 Implement web side (see above)
3. 🧪 Test on real devices
4. 🚀 Deploy web app to production
5. 📱 Test complete QR flow end-to-end

---

## Future Enhancements

- [ ] Add QR code to share button (not just lobby screen)
- [ ] Support profile QR codes
- [ ] Add analytics tracking for QR scans
- [ ] Generate app store badges in download prompt
- [ ] Add "Copy Link" button alongside QR
- [ ] Support custom QR code styling/branding

---

**Status**: Mobile Complete ✅ | Web Pending 📋

Last Updated: December 11, 2024
