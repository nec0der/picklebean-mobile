import { View } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`w-2 h-2 rounded-full ${
            index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      ))}
    </View>
  );
};
