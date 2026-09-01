<script setup lang="ts">
import LazyModalInput from "~/components/modal/Input.vue";
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
      label: "Odpustiť platbu",
      icon: "i-ph-prohibit-inset",
      onSelect: async () => {
        try {
          const response = await $fetch(
            `/api/payments/${row.original.id as NonEmptyString}`,
            {
              method: "PATCH",
              body: {
                status: "forgiven",
              },
            },
          );

          if (response) {
            row.original.status = "forgiven";
          }
        } catch (error) {
          toast.add({
            title: "Nepodarilo sa odpustiť platbu.",
            color: "error",
          });
        }
      },
    },
    {
      label: "Označiť ako zaplatenú",
      icon: "i-ph-checks",
      onSelect: async () => {
        try {
          const response = await $fetch(
            `/api/payments/${row.original.id as NonEmptyString}`,
            {
              method: "PATCH",
              body: {
                status: "paid",
              },
            },
          );

          if (response) {
            row.original.status = "paid";
          }
        } catch (error) {
          toast.add({
            title: "Nepodarilo sa označiť platbu ako zaplatenú.",
            color: "error",
          });
        }
      },
    },
    {
      type: "separator",
    },
    {
      label: "Zmeniť sumu",
      icon: "i-ph-pencil-simple",
      color: "info",
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

        if (!newAmount) {
          return;
        }

        const processedAmount = Math.round(newAmount * 100);

        try {
          const response = await $fetch(
            `/api/payments/${row.original.id as NonEmptyString}`,
            {
              method: "PATCH",
              body: {
                amount: processedAmount,
              },
            },
          );

          if (response) {
            row.original.amount = processedAmount;
          }
        } catch (error) {
          toast.add({
            title: "Nepodarilo sa zmeniť sumu platby",
            color: "error",
          });
        }
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
