import { memo } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { getLobbyUrl } from '@/lib/config';

interface QRCodeModalProps {
  visible: boolean;
  roomCode: string;
  onClose: () => void;
}

/**
 * QR Code Modal
 * Displays a scannable QR code for the lobby that opens the web app
 * which then redirects to the mobile app if installed
 */
export const QRCodeModal = memo(({ visible, roomCode, onClose }: QRCodeModalProps) => {
  const qrCodeUrl = getLobbyUrl(roomCode);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        {/* Header */}
        <View className="relative flex-row items-center justify-center px-4 py-3 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">Scan to Join</Text>
          <Pressable onPress={onClose} className="absolute p-2 right-4">
            <X size={24} color="#6b7280" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="items-center justify-center px-4 py-8"
        >
          {/* QR Code */}
          <View className="items-center p-6 bg-white shadow-lg rounded-2xl">
            <QRCode value={qrCodeUrl} size={256} />
          </View>

          {/* Room Code */}
          <View className="items-center mt-8">
            <Text className="mb-2 text-sm font-medium text-gray-500">
              ROOM CODE
            </Text>
            <Text className="text-4xl font-bold tracking-widest text-gray-900">
              {roomCode}
            </Text>
          </View>

          {/* Instructions */}
          <View className="w-full max-w-sm px-6 py-4 mt-8 bg-blue-50 rounded-xl">
            <Text className="mb-2 text-base font-semibold text-center text-blue-900">
              📱 How to Join
            </Text>
            <View className="space-y-2">
              <Text className="text-sm leading-relaxed text-center text-blue-800">
                1. Open your phone's camera app
              </Text>
              <Text className="text-sm leading-relaxed text-center text-blue-800">
                2. Point at the QR code above
              </Text>
              <Text className="text-sm leading-relaxed text-center text-blue-800">
                3. Tap the notification to join
              </Text>
            </View>
          </View>

          {/* URL Display (for reference) */}
          <View className="w-full max-w-sm px-4 py-3 mt-6 bg-gray-100 rounded-lg">
            <Text className="text-xs text-center text-gray-600 break-all">
              {qrCodeUrl}
            </Text>
          </View>
        </ScrollView>

        {/* Close Button */}
        <View className="px-4 py-4 border-t border-gray-200">
          <Pressable
            onPress={onClose}
            className="items-center py-4 bg-gray-100 rounded-xl active:bg-gray-200"
          >
            <Text className="text-base font-semibold text-gray-700">Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
});

QRCodeModal.displayName = 'QRCodeModal';
