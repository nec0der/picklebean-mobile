import { memo } from 'react';
import { Image } from '@gluestack-ui/themed';
import { View } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'xs',
  md: 'md',
  lg: 'xl',
} as const;

export const Logo = memo(({ size = 'md' }: LogoProps) => {
  return (
    <View className="items-center justify-center">
      <Image
        source={require('../../../assets/logo.svg')}
        alt="Picklebean Logo"
        size={sizeMap[size]}
      />
    </View>
  );
});

export type { LogoProps };
