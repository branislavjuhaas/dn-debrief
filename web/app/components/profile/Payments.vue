<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { RowSelectionState } from "@tanstack/vue-table";

const props = defineProps<{
  payments: Payment[];
  userId: string;
  isPending: boolean;
}>();

// Resolved UI components for TanStack table cell render functions
const UButton = resolveComponent("UButton");
const UCheckbox = resolveComponent("UCheckbox");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

// Row selection state & helpers
const rowSelection = ref<RowSelectionState>({});

const selectedPaymentIds = computed<string[]>(() =>
  Object.keys(rowSelection.value)
    .filter((id) => rowSelection.value[id])
    .map((id) => props.payments[Number(id)]?.id)
    .filter((id): id is string => id !== undefined),
);

const hasSelection = computed(() => selectedPaymentIds.value.length > 0);

// Data refresh helper
const refreshPayments = async () => {
  await refreshNuxtData(`users-${props.userId}-payments`);
};

// Payment action handlers
const addPayment = async () => {
  await promptCreatePayment(props.userId, {
    onUpdated: refreshPayments,
  });
};

const changePaymentsStatus = async () => {
  await promptBatchResolvePayments(selectedPaymentIds.value, {
    onUpdated: async () => {
      await refreshPayments();
      rowSelection.value = {};
    },
  });
};

// Table columns configuration
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
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: "status",
    header: "Stav platby",
    cell: ({ row }) => {
      const color = paymentStatusColors[row.original.status] ?? "neutral";
      return h(UBadge, { variant: "subtle", color }, () =>
        translatePaymentStatus(row.original.status),
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Vytvorená",
    cell: ({ row }) => formatDate(row.original.createdAt),
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
          items: getPaymentRowItems(row.original, {
            onUpdated: refreshPayments,
          }),
          "aria-label": "Akcie",
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            disabled: ["paid", "forgiven"].includes(row.original.status),
            "aria-label": "Akcie",
          }),
      );
    },
  },
];
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <UTable
      v-model:row-selection="rowSelection"
      :columns="paymentColumns"
      :loading="isPending"
      :data="payments">
      <template #loading>
        <div
          class="grid grid-cols-[1.5rem_0.95fr_0.95fr_1.9fr_2.2fr] pl-3 pr-20 gap-x-18 space-y-6">
          <USkeleton class="h-6" />
          <USkeleton class="h-6" />
          <USkeleton class="h-6 w-2/3" />
          <USkeleton class="h-6 w-3/5" />
          <USkeleton class="h-6 w-7/8" />

          <USkeleton class="h-6" />
          <USkeleton class="h-6 w-2/3" />
          <USkeleton class="h-6" />
          <USkeleton class="h-6 w-3/5" />
          <USkeleton class="h-6 w-5/8" />

          <USkeleton class="h-6" />
          <USkeleton class="h-6 w-4/5" />
          <USkeleton class="h-6 w-6/7" />
          <USkeleton class="h-6 w-1/2" />
          <USkeleton class="h-6" />
        </div>
      </template>
    </UTable>
    <div class="flex flex-row justify-end gap-4">
      <UButton
        label="Zmeniť stav platieb"
        icon="i-ph-seal-check"
        color="neutral"
        variant="subtle"
        :disabled="!hasSelection"
        :loading="isPending"
        @click="changePaymentsStatus" />
      <UButton
        label="Nárokovať novú platbu"
        icon="i-ph-credit-card"
        variant="subtle"
        :loading="isPending"
        @click="addPayment" />
    </div>
  </div>
</template>
