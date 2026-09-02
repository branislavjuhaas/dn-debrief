<script setup lang="ts">
import LazyModalInput from "~/components/modal/Input.vue";
import { LazyModalResolvePayments, LazyModalCreatePayment } from "#components";
import type { TableColumn } from "@nuxt/ui";
import type { RowSelectionState } from "@tanstack/vue-table";

const props = defineProps<{
  payments: Payment[];
  userId: string;
  isPending: boolean;
}>();

const UButton = resolveComponent("UButton");
const UCheckbox = resolveComponent("UCheckbox");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

const currencyFormatter = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
  timeStyle: "short",
});

const paymentColumns: TableColumn<Payment>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Vybrať všetky",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Vybrať riadok",
      }),
  },
  {
    accessorKey: "description",
    header: "Popis",
  },
  {
    accessorKey: "amount",
    header: "Suma",
    cell: ({ row }) => currencyFormatter.format(row.original.amount / 100),
  },
  {
    accessorKey: "status",
    header: "Stav platby",
    cell: ({ row }) => {
      const colorMap: Record<
        Payment["status"],
        "warning" | "success" | "info" | "error" | "neutral"
      > = {
        pending: "warning",
        processing: "warning",
        paid: "success",
        forgiven: "info",
        cancelled: "error",
        failed: "error",
      };

      const color = colorMap[row.original.status] ?? "neutral";

      return h(UBadge, { variant: "subtle", color }, () =>
        translatePaymentStatus(row.original.status),
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Vytvorená",
    cell: ({ row }) => {
      const date = row.original.createdAt
        ? new Date(row.original.createdAt)
        : null;
      return date && !isNaN(date.getTime()) ? dateFormatter.format(date) : "—";
    },
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: "end",
          },
          items: getRowItems(row),
          "aria-label": "Actions dropdown",
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            disabled: ["paid", "forgiven"].includes(row.original.status),
            "aria-label": "Actions dropdown",
          }),
      );
    },
  },
];

const toast = useToast();

const getRowItems = (row: any) => {
  return [
    {
      label: "Zmeniť stav",
      icon: "i-ph-seal-check",
      onSelect: async () => {
        const overlay = useOverlay();
        const modal = overlay.create(LazyModalResolvePayments);
        const instance = modal.open({
          initialValue: row.original.status,
        });

        const result = await instance.result;

        if (!result) return;

        let originalStatus = row.original.status;
        row.original.status = result.status;

        await $fetch("/api/payments/resolve", {
          method: "PATCH",
          body: {
            paymentIds: [row.original.id],
            status: result.status,
            note: result.note,
          },
          onResponseError: ({ error }) => {
            toast.add({
              title: "Chyba",
              description: `Nepodarilo sa zmeniť stav platby: ${error?.message ?? "neznáma chyba"}`,
              color: "error",
            });
            row.original.status = originalStatus;
          },
        });
      },
    },
    {
      label: "Zmeniť sumu",
      icon: "i-ph-currency-eur",
      onSelect: async () => {
        const overlay = useOverlay();
        const modal = overlay.create(LazyModalInput<number>);

        const instance = modal.open({
          title: "Zmeniť sumu platby",
          description: `Zadajte, prosím novú sumu pre položku: "${row.original.description}"`,
          type: "number",
          initialValue: row.original.amount / 100,
          confirmLabel: "Zmeniť",
        });

        const newAmount = await instance.result;

        if (!newAmount) return;

        const processedAmount = Math.round(newAmount * 100);

        let originalAmount = row.original.amount;
        row.original.amount = processedAmount;

        await $fetch("/api/payments/adjust", {
          method: "PATCH",
          body: {
            paymentIds: [row.original.id],
            amount: processedAmount,
          },
          onResponseError: ({ error }) => {
            toast.add({
              title: "Chyba",
              description: `Nepodarilo sa zmeniť sumu platby: ${error?.message ?? "neznáma chyba"}`,
              color: "error",
            });
            row.original.amount = originalAmount;
          },
        });
      },
    },
  ];
};

const rowSelection = ref<RowSelectionState>({});

const addPayment = async () => {
  const overlay = useOverlay();
  const modal = overlay.create(LazyModalCreatePayment);
  const instance = modal.open();
  const result = await instance.result;

  if (!result) return;

  const { amount, description } = result;

  await $fetch("/api/payments", {
    method: "POST",
    body: {
      userId: Number(props.userId),
      amount: amount * 100,
      description,
    },
    onResponseError: ({ error }) => {
      toast.add({
        title: "Chyba",
        description: `Nepodarilo sa pridať platbu: ${error?.message ?? "neznáma chyba"}`,
        color: "error",
      });
    },
    onResponse: async () => {
      await refreshNuxtData(`users-${props.userId}-payments`);
    },
  });
};

const changePaymentsStatus = async () => {
  const overlay = useOverlay();
  const modal = overlay.create(LazyModalResolvePayments);
  const instance = modal.open();

  const result = await instance.result;

  if (!result) return;

  const selectedIds = Object.keys(rowSelection.value)
    .filter((id) => rowSelection.value[id])
    .map((id) => props.payments[Number(id)]?.id)
    .filter((id): id is string => id !== undefined);

  await $fetch("/api/payments/resolve", {
    method: "PATCH",
    body: {
      paymentIds: selectedIds,
      status: result.status,
      note: result.note,
    },
    onResponseError: ({ error }) => {
      toast.add({
        title: "Chyba",
        description: `Nepodarilo sa zmeniť stav platby: ${error?.message ?? "neznáma chyba"}`,
        color: "error",
      });
    },
    onResponse: async ({ response }) => {
      if (response.ok) {
        await refreshNuxtData(`users-${props.userId}-payments`);
      }
    },
  });
};
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <div class="flex flex-row justify-end gap-4">
      <UButton
        label="Zmeniť stav platieb"
        icon="i-ph-seal-check"
        color="neutral"
        variant="subtle"
        :disabled="Object.keys(rowSelection).length === 0"
        :loading="isPending"
        @click="changePaymentsStatus" />
      <UButton
        label="Nárokovať novú platbu"
        icon="i-ph-credit-card"
        variant="subtle"
        :loading="isPending"
        @click="addPayment" />
    </div>
    <UTable
      v-model:row-selection="rowSelection"
      :columns="paymentColumns"
      :data="payments"
      :loading="isPending">
      <template #empty> Platby sa načítavajú... </template>
    </UTable>
  </div>
</template>
