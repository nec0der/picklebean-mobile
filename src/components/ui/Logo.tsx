import { memo } from 'react';
import { View, Image } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { width: 60, height: 60 },
  md: { width: 100, height: 100 },
  lg: { width: 140, height: 140 },
};

export const Logo = memo(({ size = 'md' }: LogoProps) => {
  const dimensions = sizeMap[size];

  return (
    <View className="items-center justify-center">
      <Image
        source={require('@/../assets/logo.svg')}
        style={dimensions}
        resizeMode="contain"
      />
    </View>
  );
});

export type { LogoProps };
