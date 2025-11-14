# NativeWind v4 Setup Fix

## Problem
NativeWind wasn't working on mobile - black screen with content positioned in top-left corner.

## Root Cause
Missing Babel configuration for NativeWind v4. The `className` props weren't being transformed into React Native styles.

## Solution Applied

### 1. Created `babel.config.js`
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      'nativewind/babel',  // Critical for NativeWind v4
    ],
  };
};
```

### 2. Installed Missing Dependency
```bash
npm install --save-dev babel-preset-expo
```

### 3. Cleared Metro Cache
The Expo server was restarted with cache cleared (`-c` flag).

## How NativeWind v4 Works

NativeWind v4 uses **Babel transformation** to convert:
```tsx
<View className="flex-1 bg-white items-center justify-center">
```

Into React Native style objects at build time:
```tsx
<View style={{ flex: 1, backgroundColor: '#ffffff', ... }}>
```

Without the Babel preset:
- ❌ `className` props are ignored
- ❌ No styles are applied
- ❌ Components collapse to default positions
- ❌ Black screen appears

## Files Configured

✅ `tailwind.config.js` - Theme and content paths
✅ `global.css` - Tailwind directives
✅ `metro.config.js` - Metro bundler config
✅ `nativewind-env.d.ts` - TypeScript types
✅ `babel.config.js` - **Babel transformation (THE FIX)**

## Testing

After the fix, the app should display:
- White background
- Centered content
- Properly colored text (primary-600 blue)
- Correct spacing and layout

## Next Time

When setting up NativeWind v4, remember the **Babel preset is required**!

```javascript
presets: [
  'babel-preset-expo',
  'nativewind/babel',  // Don't forget this!
],
