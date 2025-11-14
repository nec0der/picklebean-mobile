import { memo, useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import type { TextInputProps } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = memo(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  secureTextEntry,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const handleToggleSecure = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View className={fullWidth ? 'w-full' : ''}>
      {label && (
        <Text className="text-sm font-medium text-secondary-700 mb-1.5">
          {label}
        </Text>
      )}
      
      <View
        className={`
          flex-row
          items-center
          border
          rounded-lg
          px-3
          ${isFocused ? 'border-primary-500' : error ? 'border-error' : 'border-secondary-300'}
          ${error ? 'bg-red-50' : 'bg-white'}
        `}
      >
        {leftIcon && (
          <View className="mr-2">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          className="flex-1 py-3 text-base text-secondary-900"
          placeholderTextColor="#94a3b8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...props}
        />
        
        {secureTextEntry && (
          <Pressable onPress={handleToggleSecure} className="ml-2">
            <Text className="text-sm text-primary-600">
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        )}
        
        {rightIcon && !secureTextEntry && (
          <View className="ml-2">
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text className="text-sm text-error mt-1">
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text className="text-sm text-secondary-500 mt-1">
          {helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';
