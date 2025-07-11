import { ref, readonly } from "vue";

export interface ToastAction {
  text: string;
  to?: string;
  onClick?: () => void;
}

export interface Toast {
  id: number;
  title?: string;
  text: string;
  variant?: "info" | "warning";
  autoClose?: boolean;
  duration?: number;
  action?: ToastAction;
}

const toasts = ref<Toast[]>([]);

let id = 0;

export function useToast() {
  const addToast = (toast: Omit<Toast, "id">) => {
    const newToast = {
      ...toast,
      id: id++,
      autoClose: toast.autoClose ?? true,
      duration: toast.duration ?? 5000,
      variant: toast.variant ?? "info",
    };
    toasts.value.push(newToast);
  };

  return {
    toasts: readonly(toasts),
    addToast,
  };
}
