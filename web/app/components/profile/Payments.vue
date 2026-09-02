<script setup lang="ts">
import LazyModalInput from "~/components/modal/Input.vue";
import { LazyModalResolvePayments } from "#components";
import type { TableColumn } from "@nuxt/ui";

defineProps<{
  payments: Payment[];
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
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Select row",
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
          onResponseError: (error) => {
            toast.add({
              title: "Chyba",
              description: "Nepodarilo sa zmeniť stav platby",
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

        // Create instances for different data types
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
          onResponseError: (error) => {
            toast.add({
              title: "Chyba",
              description: "Nepodarilo sa zmeniť sumu platby",
              color: "error",
            });
            row.original.amount = originalAmount;
          },
        });
      },
    },
  ];
};
</script>

<template>
  <UTable :columns="paymentColumns" :data="payments" :loading="isPending">
    <template #empty> Platby sa načítavajú... </template>
  </UTable>
</template>
