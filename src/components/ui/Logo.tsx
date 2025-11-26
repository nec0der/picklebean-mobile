import { memo } from 'react';
import { View } from 'react-native';
import LogoSvg from '../../../assets/logo.svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { width: 100, height: 50 },
  md: { width: 150, height: 75 },
  lg: { width: 200, height: 100 },
} as const;

export const Logo = memo(({ size = 'md' }: LogoProps) => {
  const dimensions = sizeMap[size];
  
  return (
    <View className="items-center justify-center">
      <LogoSvg width={dimensions.width} height={dimensions.height} />
    </View>
  );
});

Logo.displayName = 'Logo';

export type { LogoProps };
