import { useToast as useGluestackToast, Toast, ToastTitle, HStack, Icon } from '@gluestack-ui/themed';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface UseToastReturn {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export const useToast = (): UseToastReturn => {
  const toast = useGluestackToast();

  const show = (message: string, type: ToastType): void => {
    const actionMap = {
      success: 'success',
      error: 'error',
      info: 'info',
      warning: 'warning',
    } as const;

    const bgColors = {
      success: '$success600',
      error: '$error600',
      info: '$info600',
      warning: '$warning600',
    };

    const iconMap = {
      success: CheckCircle,
      error: AlertCircle,
      info: Info,
      warning: AlertTriangle,
    };

    toast.show({
      placement: 'top',
      duration: 3000,
      render: ({ id }) => (
        <Toast 
          nativeID={id} 
          action={actionMap[type]} 
          variant="solid" 
          bg={bgColors[type]}
          borderRadius="$lg"
          mx="$4"
          px="$4"
          py="$3"
        >
          <HStack space="md" alignItems="center">
            <Icon as={iconMap[type]} size="xl" color="$white" />
            <ToastTitle color="$white" flex={1}>
              {message}
            </ToastTitle>
          </HStack>
        </Toast>
      ),
    });
  };

  return {
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    info: (message: string) => show(message, 'info'),
    warning: (message: string) => show(message, 'warning'),
  };
};

export type { UseToastReturn };
