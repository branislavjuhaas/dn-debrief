import { ref, readonly } from "vue";

export type AlertVariant = "warning" | "critical";

export interface AlertOptions {
  title: string;
  content: string;
  variant?: AlertVariant;
  icon?: string;
  continueText?: string;
  cancelText?: string;
  onContinue?: () => void;
  onCancel?: () => void;
}

const alertState = ref<AlertOptions | null>(null);

export function useAlert() {
  const showAlert = (options: AlertOptions) => {
    alertState.value = {
      title: options.title,
      content: options.content,
      variant: options.variant,
      icon: options.icon,
      continueText: options.continueText,
      cancelText: options.cancelText,
      onContinue: options.onContinue,
      onCancel: options.onCancel,
    };
  };

  const hideAlert = () => {
    if (alertState.value) {
      alertState.value = null;
    }
  };

  return {
    alert: readonly(alertState),
    showAlert,
    hideAlert,
  };
}
