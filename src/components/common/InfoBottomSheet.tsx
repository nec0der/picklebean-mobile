import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Box, Heading, VStack } from '@gluestack-ui/themed';
import { X } from 'lucide-react-native';

interface InfoBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string[];
}

export const InfoBottomSheet = ({ visible, onClose, title, content }: InfoBottomSheetProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50" 
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="flex-1" />
        
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
          <Box className="px-6 pt-6 pb-12 bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Heading size="xl" className="text-gray-900">
                {title}
              </Heading>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>

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
          </Box>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
