import {
  Toast,
  ToastDescription,
  useToast as useGluestackToast,
} from "@gluestack-ui/themed";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react-native";

type ToastType = "success" | "error" | "info" | "warning";

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
      success: "success",
      error: "error",
      info: "info",
      warning: "warning",
    } as const;

    const iconMap = {
      success: CheckCircle,
      error: AlertCircle,
      info: Info,
      warning: AlertTriangle,
    };

    const bgColors = {
      success: "!bg-green-100",
      error: "!bg-red-100",
      info: "bg-info-500",
      warning: "bg-warning-500",
    };

    const textColors = {
      success: "!text-green-600",
      error: "!text-red-600",
      info: "!text-white",
      warning: "!text-gray-900",
    };

    const iconColors = {
      success: "white",
      error: "#DC2626", // red-600
      info: "white",
      warning: "#1F2937", // gray-900
    };

    toast.show({
      placement: "top",
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            nativeID={uniqueToastId}
            action={actionMap[type]}
            variant="outline"
            className={`p-4 rounded-lg shadow-lg  ${bgColors[type]}`}
          >
            <ToastDescription size="md" className={`${textColors[type]} font-semibold leading-relaxed`}>
              {message}
            </ToastDescription>
          </Toast>
        );
      },
    });
  };

  return {
    success: (message: string) => show(message, "success"),
    error: (message: string) => show(message, "error"),
    info: (message: string) => show(message, "info"),
    warning: (message: string) => show(message, "warning"),
  };
};

export type { UseToastReturn };
