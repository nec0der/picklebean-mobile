# Tailwind Text Styling

## Important Style Modifier

When using NativeWind/Tailwind classes with UI library Text components (like Gluestack UI's `Text`), you **must** use the `!` modifier for color classes to ensure they override the component's default styles.

### Rule

Always use `!text-{color}` when styling text color in UI components.

### Examples

```typescript
// ✅ CORRECT: Using ! modifier
<Text className="text-base !text-white">
  Sign in
</Text>

<Text className="!text-gray-900 font-bold">
  Title
</Text>

// ❌ INCORRECT: Missing modifier (may be overridden)
<Text className="text-base text-white">
  Sign in
</Text>
```

### Why?
UI libraries often apply their own default styles or theme colors that have higher specificity or precedence than standard utility classes. The `!` modifier (equivalent to `!important` in CSS) ensures your utility class takes precedence.
