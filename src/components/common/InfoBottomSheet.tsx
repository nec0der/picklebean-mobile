import { 
  Actionsheet, 
  ActionsheetBackdrop, 
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  Heading,
  VStack,
  Text
} from '@gluestack-ui/themed';
import { View } from 'react-native';

interface InfoBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string[];
}

export const InfoBottomSheet = ({ 
  visible, 
  onClose, 
  title, 
  content 
}: InfoBottomSheetProps) => {
  return (
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-6 pt-4 pb-12">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        
        {/* Header */}
        <Heading size="xl" className="mt-4 mb-6 text-gray-900">
          {title}
        </Heading>

        {/* Content */}
        <VStack space="md">
          {content.map((item, index) => (
            <View key={index} className="flex-row">
              <Text className="mr-2 text-gray-600">•</Text>
              <Text className="flex-1 text-base text-gray-600">
                {item}
              </Text>
            </View>
          ))}
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
};
