# Complete Dependency Fixes for Tab Navigation

## Summary of Issues Encountered

When setting up tab navigation with Gluestack UI and NativeWind, we encountered a series of missing dependencies that needed to be resolved.

---

## Issues and Solutions

### 1. ✅ Missing `babel-preset-expo`
**Error:** `Cannot find module 'babel-preset-expo'`

**Solution:**
```bash
npm install --save-dev babel-preset-expo
```

### 2. ✅ Missing `react-native-worklets`  
**Error:** `Cannot find module 'react-native-worklets/plugin'`

**Root Cause:** NativeWind (via `react-native-css-interop`) requires this package.

**Solution:**
```bash
npm install react-native-worklets --legacy-peer-deps
```

### 3. ✅ Missing `react-native-worklets-core`
**Error:** Similar worklets error from Gluestack UI

**Solution:**
```bash
npm install react-native-worklets-core --legacy-peer-deps
```

### 4. ✅ Missing `react-native-reanimated`
**Error:** `Unable to resolve "react-native-reanimated"`

**Root Cause:** NativeWind uses Reanimated for animations

**Solution:**
```bash
npx expo install react-native-reanimated
```

---

## Final babel.config.js Configuration

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',      // Expo's preset
      'nativewind/babel',       // NativeWind transformation
    ],
    plugins: [
      'react-native-reanimated/plugin',  // MUST be last!
    ],
  };
};
```

**IMPORTANT:** The Reanimated plugin **must** be the last item in the plugins array.

---

## Complete Dependency List

### Main Dependencies
```json
{
  "@gluestack-ui/themed": "^1.1.73",
  "@gluestack-ui/config": "^1.1.20",
  "@gluestack-style/react": "^1.x",
  "lucide-react-native": "^x",
  "react-native-worklets": "^x",
  "react-native-worklets-core": "^1.x",
  "react-native-reanimated": "~3.x"
}
```

### Dev Dependencies
```json
{
  "babel-preset-expo": "^x"
}
```

---

## Why Each Package is Needed

| Package | Required By | Purpose |
|---------|-------------|---------|
| `babel-preset-expo` | Expo | Core Babel transformations for Expo |
| `react-native-worklets` | NativeWind | Enables worklet transformations |
| `react-native-worklets-core` | Gluestack UI | Worklet core functionality |
| `react-native-reanimated` | NativeWind | Animation library |
| `@gluestack-ui/*` | App | Component library |
| `lucide-react-native` | App | Icon library for tabs |

---

## Testing Instructions

### 1. Kill Existing Expo Process
```bash
pkill -f "expo start"
```

### 2. Clear Metro Cache
```bash
npx expo start -c
```

### 3. Test in Expo Go
- Scan QR code
- Verify app builds without errors
- Check all 5 tabs render
- Test tab navigation works
- Verify Play button is elevated/prominent

---

## Expected Result

After applying all fixes:
- ✅ App builds successfully
- ✅ No Babel errors
- ✅ NativeWind styling works
- ✅ Tab navigation renders
- ✅ All 5 tabs functional
- ✅ Play button (center) is elevated with green background

---

## Troubleshooting

### If Build Still Fails

1. **Clear all caches:**
   ```bash
   rm -rf node_modules
   npm install
   npx expo start -c
   ```

2. **Check node_modules:**
   ```bash
   ls node_modules/react-native-reanimated
   ls node_modules/react-native-worklets
   ```

3. **Verify babel.config.js:**
   - Reanimated plugin must be **last**
   - Check for syntax errors

### If Styles Don't Apply

1. Verify NativeWind is in babel presets
2. Check `global.css` is imported in App.tsx
3. Restart dev server with `-c` flag

---

## Files Modified

1. `babel.config.js` - Added Reanimated plugin
2. `package.json` - Added all dependencies
3. `App.tsx` - Navigation setup
4. `src/navigation/TabNavigator.tsx` - Tab configuration

---

**Status:** All dependencies installed ✅  
**Ready to test:** Yes! Restart Expo with `npx expo start -c`
