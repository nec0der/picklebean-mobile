import { memo } from 'react';
import { View } from 'react-native';
import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export interface CardProps extends Omit<ViewProps, 'style'> {
  children: ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = memo(({
  children,
  variant = 'elevated',
  padding = 'md',
  className,
  ...props
}: CardProps) => {
  const variantClasses = {
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border border-secondary-200',
    filled: 'bg-secondary-50',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View
      className={`
        rounded-lg
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </View>
  );
});

Card.displayName = 'Card';
