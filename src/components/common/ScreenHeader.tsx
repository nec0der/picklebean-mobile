import { memo, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';

interface ScreenHeaderProps {
  /**
   * Header title text (center-aligned)
   */
  title?: string;
  
  /**
   * Custom title component (overrides title prop)
   */
  titleComponent?: ReactNode;
  
  /**
   * Left action type ('back' or 'close')
   */
  leftAction?: 'back' | 'close';
  
  /**
   * Handler for left button press
   */
  onLeftPress?: () => void;
  
  /**
   * Custom left component (overrides leftAction)
   */
  leftComponent?: ReactNode;
  
  /**
   * Custom right component (e.g., Settings icon, actions)
   */
  rightComponent?: ReactNode;
  
  /**
   * Additional styling for title text
   */
  titleClassName?: string;
  
  /**
   * Hide border bottom
   */
  hideBorder?: boolean;
}

export const ScreenHeader = memo(({
  title,
  titleComponent,
  leftAction = 'back',
  onLeftPress,
  leftComponent,
  rightComponent,
  titleClassName,
  hideBorder = false,
}: ScreenHeaderProps) => {
  // Render left side
  const renderLeft = () => {
    if (leftComponent) return leftComponent;
    
    if (!onLeftPress) return <View className="w-10" />;
    
    return (
      <Pressable onPress={onLeftPress} className="p-2">
        {leftAction === 'close' ? (
          <X size={24} color="#6b7280" />
        ) : (
          <ChevronLeft size={24} color="#6b7280" />
        )}
      </Pressable>
    );
  };

  // Render title
  const renderTitle = () => {
    if (titleComponent) return titleComponent;
    
    if (title) {
      return (
        <Text className={`text-xl font-bold !text-gray-900 ${titleClassName || ''}`}>
          {title}
        </Text>
      );
    }
    
    return null;
  };

  return (
    <View className={`flex-row items-center justify-between px-4 py-2 bg-white ${hideBorder ? '' : 'border-b border-gray-200'}`}>
      {/* Left Section */}
      <View className="flex-shrink-0">
        {renderLeft()}
      </View>

      {/* Center Section - Title */}
      <View className="items-center flex-1 px-2">
        {renderTitle()}
      </View>

      {/* Right Section */}
      <View className="flex-shrink-0">
        {rightComponent || <View className="w-10" />}
      </View>
    </View>
  );
});

ScreenHeader.displayName = 'ScreenHeader';
