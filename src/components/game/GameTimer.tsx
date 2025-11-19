import { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Clock } from 'lucide-react-native';

interface GameTimerProps {
  startedAt: Date;
}

export const GameTimer = ({ startedAt }: GameTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Calculate initial elapsed time
    const calculateElapsed = (): number => {
      const now = Date.now();
      const start = startedAt.getTime();
      return Math.floor((now - start) / 1000);
    };

    // Set initial value
    setElapsed(calculateElapsed());

    // Update every second
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View className="items-center py-6">
      <View className="flex-row items-center gap-3 mb-2">
        <Clock size={24} color="#6b7280" />
        <Text className="text-sm font-medium text-gray-600">Game Time</Text>
      </View>
      <Text className="text-6xl font-bold text-gray-900 tabular-nums">
        {formattedTime}
      </Text>
    </View>
  );
};

export type { GameTimerProps };
