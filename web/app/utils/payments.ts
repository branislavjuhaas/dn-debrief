import ModalInput from "~/components/modal/Input.vue";
import ModalCreatePayment from "~/components/modal/CreatePayment.vue";
import ModalResolvePayments from "~/components/modal/ResolvePayments.vue";
import type { PaymentStatus } from "#shared/types/payment";

/**
 * Common currency formatter for EUR in Slovak locale.
 */
export const currencyFormatter = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
});

/**
 * Common date & time formatter in Slovak locale.
 */
export const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Formats an amount given in cents into a localized currency string.
 */
export const formatCurrency = (amountInCents: number): string =>
  currencyFormatter.format(amountInCents / 100);

/**
 * Formats an ISO date string or Date object, returning "—" if empty or invalid.
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return isNaN(d.getTime()) ? "—" : dateFormatter.format(d);
};

/**
 * Color mapping for payment statuses used across table badges.
 */
export const paymentStatusColors: Record<
  PaymentStatus,
  "warning" | "success" | "info" | "error" | "neutral"
> = {
  pending: "warning",
  processing: "warning",
  paid: "success",
  forgiven: "info",
  cancelled: "error",
  failed: "error",
};

// ---------------------------------------------------------------------------
// Server API fetch procedures
// ---------------------------------------------------------------------------

/**
 * Adjusts the amount for one or more payments via PATCH /api/payments/adjust.
 */
export const adjustPaymentAmount = async (
  paymentIds: string[],
  amount: number,
) => {
  return await $fetch("/api/payments/adjust", {
    method: "PATCH",
    body: {
      paymentIds,
      amount,
    },
  });
};

/**
 * Updates status and optional note for payments via PATCH /api/payments/resolve.
 */
export const resolvePayments = async (
  paymentIds: string[],
  status: PaymentStatus,
  note?: string,
) => {
  return await $fetch("/api/payments/resolve", {
    method: "PATCH",
    body: {
      paymentIds,
      status,
      note,
    },
  });
};

/**
 * Creates a new claimed payment for a user via POST /api/payments.
 */
export const createPayment = async (
  userId: number,
  amount: number,
  description: string,
) => {
  return await $fetch("/api/payments", {
    method: "POST",
    body: {
      userId,
      amount,
      description,
    },
  });
};

/**
 * Initiates checkout session for unpaid payments via POST /api/payments/checkout.
 */
export const checkoutPayments = async (paymentIds: string[]) => {
  return await $fetch<{ url?: string }>("/api/payments/checkout", {
    method: "POST",
    body: {
      paymentIds,
    },
  });
};

// ---------------------------------------------------------------------------
// Modal & Submenu procedures
// ---------------------------------------------------------------------------

export interface PaymentActionTarget {
  id: string;
  description?: string;
  amount?: number;
  status?: PaymentStatus;
}

export interface PaymentActionOptions {
  onUpdated?: () => void | Promise<void>;
  canAdjustAmount?: boolean;
}

/**
 * Prompts user with modal to adjust payment amount and syncs with server.
 */
export const promptAdjustPaymentAmount = async (
  payment: { id: string; description?: string; amount: number },
  options?: PaymentActionOptions,
) => {
  const overlay = useOverlay();
  const toast = useToast();
  const modal = overlay.create(ModalInput as any);

  const instance = modal.open({
    title: "Zmeniť sumu platby",
    description: `Zadajte, prosím novú sumu pre položku: "${payment.description ?? ""}"`,
    type: "number",
    initialValue: payment.amount / 100,
    confirmLabel: "Zmeniť",
  });

  const newAmount = (await instance.result) as number | undefined;
  if (newAmount === undefined || newAmount === null) return;

  const processedAmount = Math.round(Number(newAmount) * 100);
  const originalAmount = payment.amount;
  payment.amount = processedAmount;

  try {
    await adjustPaymentAmount([payment.id], processedAmount);
    await options?.onUpdated?.();
  } catch (error: any) {
    payment.amount = originalAmount;
    toast.add({
      title: "Chyba",
      description: `Nepodarilo sa zmeniť sumu platby: ${error?.message ?? "neznáma chyba"}`,
      color: "error",
    });
  }
};

/**
 * Prompts user with modal to resolve a single payment status and syncs with server.
 */
export const promptResolvePaymentStatus = async (
  payment: { id: string; status?: PaymentStatus },
  options?: PaymentActionOptions,
) => {
  const overlay = useOverlay();
  const toast = useToast();
  const modal = overlay.create(ModalResolvePayments as any);

  const instance = modal.open({
    initialValue: payment.status,
  });

  const result = (await instance.result) as
    | { status: PaymentStatus; note?: string }
    | undefined;
  if (!result) return;

  const originalStatus = payment.status;
  payment.status = result.status;

  try {
    await resolvePayments([payment.id], result.status, result.note);
    await options?.onUpdated?.();
  } catch (error: any) {
    if (originalStatus !== undefined) {
      payment.status = originalStatus;
    }
    toast.add({
      title: "Chyba",
      description: `Nepodarilo sa zmeniť stav platby: ${error?.message ?? "neznáma chyba"}`,
      color: "error",
    });
  }
};

/**
 * Prompts user with modal to batch resolve payment statuses and syncs with server.
 */
export const promptBatchResolvePayments = async (
  paymentIds: string[],
  options?: PaymentActionOptions,
) => {
  if (paymentIds.length === 0) return;

  const overlay = useOverlay();
  const toast = useToast();
  const modal = overlay.create(ModalResolvePayments as any);
  const instance = modal.open();

  const result = (await instance.result) as
    | { status: PaymentStatus; note?: string }
    | undefined;
  if (!result) return;

  try {
    await resolvePayments(paymentIds, result.status, result.note);
    await options?.onUpdated?.();
  } catch (error: any) {
    toast.add({
      title: "Chyba",
      description: `Nepodarilo sa zmeniť stav platby: ${error?.message ?? "neznáma chyba"}`,
      color: "error",
    });
  }
};

/**
 * Prompts user with modal to claim / create a new payment for a user.
 */
export const promptCreatePayment = async (
  userId: number | string,
  options?: PaymentActionOptions,
) => {
  const overlay = useOverlay();
  const toast = useToast();
  const modal = overlay.create(ModalCreatePayment as any);
  const instance = modal.open();

  const result = (await instance.result) as
    | { amount: number; description: string }
    | undefined;
  if (!result) return;

  const { amount, description } = result;

  try {
    await createPayment(Number(userId), Math.round(amount * 100), description);
    await options?.onUpdated?.();
  } catch (error: any) {
    toast.add({
      title: "Chyba",
      description: `Nepodarilo sa pridať platbu: ${error?.message ?? "neznáma chyba"}`,
      color: "error",
    });
  }
};

/**
 * Generates reusable dropdown submenu items for payment table rows.
 */
export const getPaymentRowItems = (
  payment: PaymentActionTarget,
  options?: PaymentActionOptions,
) => {
  const items = [];

  const canAdjust = options?.canAdjustAmount ?? payment.amount !== undefined;

  if (canAdjust && payment.amount !== undefined) {
    items.push({
      label: "Zmeniť sumu",
      icon: "i-ph-currency-eur",
      onSelect: () =>
        promptAdjustPaymentAmount(
          payment as { id: string; description?: string; amount: number },
          options,
        ),
    });
  }

  items.push({
    label: "Zmeniť stav",
    icon: "i-ph-seal-check",
    onSelect: () => promptResolvePaymentStatus(payment, options),
  });

  return items;
};
