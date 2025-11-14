# Styling with NativeWind

## NativeWind Basics

NativeWind brings Tailwind CSS to React Native. Use the `className` prop for all styling.

---

## Styling Rules

### 1. Use className Exclusively

```typescript
// ✅ CORRECT: NativeWind className
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-900">
    Title
  </Text>
  <Text className="mt-2 text-base text-gray-600">
    Description
  </Text>
</View>

// ❌ INCORRECT: Inline styles
<View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Title</Text>
</View>
```

### 2. No StyleSheet.create

Avoid `StyleSheet.create` unless absolutely necessary:

```typescript
// ❌ AVOID: StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

// ✅ CORRECT: className with NativeWind
<View className="flex-1 p-4">
```

### 3. Responsive Design

Use Tailwind breakpoint prefixes:

```typescript
// ✅ CORRECT: Responsive classes
<View className="p-4 sm:p-6 md:p-8">
  <Text className="text-lg sm:text-xl md:text-2xl">
    Responsive Text
  </Text>
</View>
```

### 4. Theme Consistency

Use theme colors from `tailwind.config.js`:

```typescript
// ✅ CORRECT: Theme colors
<View className="bg-primary">
  <Text className="text-white">Button</Text>
</View>

// ❌ INCORRECT: Arbitrary colors
<View className="bg-[#007bff]">
```

### 5. Conditional Styles

```typescript
// ✅ CORRECT: Conditional classes
const buttonClasses = [
  'px-4 py-2 rounded-lg',
  variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500',
  disabled && 'opacity-50',
].filter(Boolean).join(' ');

<Pressable className={buttonClasses}>
  <Text className="text-white font-semibold">{title}</Text>
</Pressable>
```

---

## Common Patterns

### Layout

```typescript
// Flex container
<View className="flex-1">

// Row layout
<View className="flex-row items-center">

// Column layout  
<View className="flex-col">

// Center content
<View className="flex-1 justify-center items-center">

// Space between
<View className="flex-row justify-between">
```

### Spacing

```typescript
// Padding
<View className="p-4">        // 16px all sides
<View className="px-4 py-2">  // 16px horizontal, 8px vertical
<View className="pt-4">       // 16px top only

// Margin
<View className="m-4">        // 16px all sides
<View className="mx-4 my-2">  // 16px horizontal, 8px vertical
<View className="mt-4">       // 16px top only

// Gap (for flex children)
<View className="flex-row gap-2">
```

### Typography

```typescript
// Size
<Text className="text-sm">    // 14px
<Text className="text-base">  // 16px
<Text className="text-lg">    // 18px
<Text className="text-xl">    // 20px
<Text className="text-2xl">   // 24px

// Weight
<Text className="font-normal">    // 400
<Text className="font-medium">    // 500
<Text className="font-semibold">  // 600
<Text className="font-bold">      // 700

// Color
<Text className="text-gray-900">
<Text className="text-blue-500">
```

### Colors

```typescript
// Background
<View className="bg-white">
<View className="bg-gray-100">
<View className="bg-blue-500">

// Border
<View className="border border-gray-300">
<View className="border-2 border-blue-500">

// Text
<Text className="text-gray-900">
<Text className="text-red-500">
```

### Borders & Shadows

```typescript
// Rounded corners
<View className="rounded">        // 4px
<View className="rounded-lg">     // 8px
<View className="rounded-full">   // 9999px

// Shadows
<View className="shadow-sm">
<View className="shadow-md">
<View className="shadow-lg">
```

---

## Platform-Specific Styling

Use Platform Detection sparingly:

```typescript
import { Platform } from 'react-native';

// Only when NativeWind can't handle it
<View className={Platform.select({
  ios: 'pt-safe',
  android: 'pt-4',
})}>
```

---

## Dark Mode Support

```typescript
// Use dark: prefix for dark mode variants
<View className="bg-white dark:bg-gray-900">
  <Text className="text-gray-900 dark:text-white">
    Text
  </Text>
</View>
```

---

## Component Variants

```typescript
// Create reusable component variants
interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onPress: () => void;
}

export const Button = ({ 
  title, 
  variant = 'primary', 
  size = 'md',
  onPress 
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-blue-500 active:bg-blue-600',
    secondary: 'bg-gray-500 active:bg-gray-600',
    ghost: 'bg-transparent active:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <Pressable 
      onPress={onPress}
      className={`rounded-lg ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      <Text className="text-white font-semibold text-center">
        {title}
      </Text>
    </Pressable>
  );
};
```

---

## Avoid

```typescript
// ❌ Inline style objects
<View style={{ marginTop: 20 }}>

// ❌ StyleSheet.create
const styles = StyleSheet.create({ /* ... */ });

// ❌ Mixing approaches
<View style={styles.container} className="p-4">

// ❌ Arbitrary values (use theme)
<View className="bg-[#FF5733]">

// ❌ Magic numbers
<View style={{ paddingTop: 23 }}>
