import { View, Text, Pressable } from 'react-native';
import { memo } from 'react';
import { QrCode, Radio } from 'lucide-react-native';

interface LobbyHeaderProps {
  roomCode: string;
  isScanning: boolean;
  onQrPress: () => void;
  onScanPress: () => void;
}

export const LobbyHeader = memo(({ 
  roomCode, 
  isScanning, 
  onQrPress, 
  onScanPress 
}: LobbyHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      {/* Room Code */}
      <Text className="text-3xl font-bold tracking-wide text-gray-900">
        {roomCode}
      </Text>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        {/* QR Code Button */}
        <Pressable
          onPress={onQrPress}
          className="flex-row items-center justify-center h-10 px-4 bg-gray-100 rounded-lg active:bg-gray-200"
        >
          <QrCode size={20} color="#374151" />
        </Pressable>

        {/* Scan Button */}
        <Pressable
          onPress={onScanPress}
          className={`h-10 px-4 rounded-lg flex-row items-center justify-center ${
            isScanning 
              ? 'bg-green-500 active:bg-green-600' 
              : 'bg-gray-100 active:bg-gray-200'
          }`}
        >
          <Radio 
            size={20} 
            color={isScanning ? '#ffffff' : '#374151'} 
          />
        </Pressable>
      </View>
    </View>
  );
});

export type { LobbyHeaderProps };
