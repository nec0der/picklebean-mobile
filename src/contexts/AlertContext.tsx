import { createContext, useState, useCallback, ReactNode } from 'react';

type AlertStyle = 'default' | 'destructive';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: AlertStyle;
}

interface AlertContextValue {
  showAlert: (title: string, message?: string) => void;
  showConfirm: (
    title: string,
    message?: string,
    options?: {
      onConfirm?: () => void;
      confirmText?: string;
      confirmStyle?: AlertStyle;
      cancelText?: string;
    }
  ) => void;
  // Internal state for rendering
  isVisible: boolean;
  config: AlertConfig | null;
  hideAlert: () => void;
}

export const AlertContext = createContext<AlertContextValue | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    // Clear config after animation
    setTimeout(() => setConfig(null), 300);
  }, []);

  const showAlert = useCallback((title: string, message?: string) => {
    setConfig({
      title,
      message,
      buttons: [{ text: 'OK', onPress: hideAlert }],
      type: 'default',
    });
    setIsVisible(true);
  }, [hideAlert]);

  const showConfirm = useCallback(
    (
      title: string,
      message?: string,
      options?: {
        onConfirm?: () => void;
        confirmText?: string;
        confirmStyle?: AlertStyle;
        cancelText?: string;
      }
    ) => {
      const { onConfirm, confirmText = 'Confirm', confirmStyle = 'default', cancelText = 'Cancel' } = options || {};

      setConfig({
        title,
        message,
        buttons: [
          {
            text: cancelText,
            style: 'cancel',
            onPress: hideAlert,
          },
          {
            text: confirmText,
            style: confirmStyle === 'destructive' ? 'destructive' : 'default',
            onPress: () => {
              hideAlert();
              onConfirm?.();
            },
          },
        ],
        type: confirmStyle,
      });
      setIsVisible(true);
    },
    [hideAlert]
  );

  const value: AlertContextValue = {
    showAlert,
    showConfirm,
    isVisible,
    config,
    hideAlert,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};
