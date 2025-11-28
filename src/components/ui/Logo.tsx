import { memo } from 'react';
import { Image, View } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { width: 150, height: 38 },
  md: { width: 200, height: 50 },
  lg: { width: 250, height: 63 },
} as const;

export const Logo = memo(({ size = 'md' }: LogoProps) => {
  const dimensions = sizeMap[size];
  
  return (
    <View className="items-center justify-center">
      <Image 
        source={require('../../../assets/logo.png')}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
        }}
        resizeMode="contain"
      />
    </View>
  );
});

Logo.displayName = 'Logo';

export type { LogoProps };
