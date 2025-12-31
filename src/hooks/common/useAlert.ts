import { useContext } from 'react';
import { AlertContext } from '@/contexts/AlertContext';

interface UseAlertReturn {
  show: (title: string, message?: string) => void;
  confirm: (
    title: string,
    message?: string,
    options?: {
      onConfirm?: () => void;
      confirmText?: string;
      confirmStyle?: 'default' | 'destructive';
      cancelText?: string;
    }
  ) => void;
}

export const useAlert = (): UseAlertReturn => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }

  return {
    show: context.showAlert,
    confirm: context.showConfirm,
  };
};
