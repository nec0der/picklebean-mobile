import { memo } from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import type { PressableProps } from 'react-native';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button = memo(({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary-500 active:bg-primary-600',
    secondary: 'bg-secondary-500 active:bg-secondary-600',
    ghost: 'bg-transparent active:bg-secondary-100',
    danger: 'bg-error active:bg-red-600',
    subtle: 'bg-gray-100 border border-gray-200 active:bg-gray-200',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: 'text-primary-600',
    danger: 'text-white',
    subtle: 'text-gray-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`
        rounded-2xl
        items-center
        justify-center
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' || variant === 'subtle' ? '#4B5563' : '#ffffff'}
        />
      ) : (
        <Text
          className={`
            font-semibold
            text-center
            ${textVariantClasses[variant]}
            ${textSizeClasses[size]}
          `}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
});

Button.displayName = 'Button';

export type { ButtonProps as ButtonComponentProps };
