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

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  // Format time based on duration
  const formattedTime = hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View className="items-center">
      <Text className="text-7xl font-bold !text-gray-900 tabular-nums tracking-tight">
        {formattedTime}
      </Text>
    </View>
  );
};

export type { GameTimerProps };
