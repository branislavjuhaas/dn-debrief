<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

// Page metadata & access control
definePageMeta({
  middleware: ["auth"],
  allowedRoles: ["developer", "admin"],
});

useSeoMeta({
  title: "Správa platieb",
  description:
    "Správa a štatistické údaje platieb za členstvo v SDA a registrácie na podujatia na platforme DebRIEF.",
});

// Data fetching
const { data: paymentsFetch } = await useFetch("/api/payments", {
  key: "payments",
});

const { data: paymentsData } =
  useNuxtData<typeof paymentsFetch.value>("payments");

// Resolved UI components for table cells
const UBadge = resolveComponent("UBadge");
const UUser = resolveComponent("UUser");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

// Computed payment statistics for toolbar summary
const paymentStats = computed(() => {
  const all = Number(paymentsData.value?.stats.all ?? 0);
  const unpaid = Number(paymentsData.value?.stats.unpaid ?? 0);
  const forgiven = Number(paymentsData.value?.stats.forgiven ?? 0);

  const unpaidPercentage = all > 0 ? ((unpaid / all) * 100).toFixed(2) : "0.00";
  const forgivenPercentage =
    all > 0 ? ((forgiven / all) * 100).toFixed(2) : "0.00";

  return {
    allFormatted: `${all / 100} €`,
    unpaidFormatted: `${unpaid / 100} €`,
    unpaidPercentage: `${unpaidPercentage} %`,
    forgivenFormatted: `${forgiven / 100} €`,
    forgivenPercentage: `${forgivenPercentage} %`,
  };
});

// Table columns configuration
type ManagePaymentRow = {
  id: string;
  description: string;
  createdAt: string;
  status: PaymentStatus;
  user: {
    id: number;
    name: string;
    surname: string;
    image: string | null;
  } | null;
};

const columns: TableColumn<ManagePaymentRow>[] = [
  {
    id: "name",
    accessorFn: (row) => `${row.user?.name ?? ""} ${row.user?.surname ?? ""}`,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Používateľ/-ka",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const name = row.original.user?.name ?? "N/A";
      const surname = row.original.user?.surname ?? "N/A";

      return h(
        UUser,
        {
          name: name,
          surname: surname,
          avatar: {
            src: row.original.user?.image ?? undefined,
            alt: `${name} ${surname}`,
          },
          to: `/users/${row.original.user?.id}`,
          size: "xs",
        },
        {
          default: () =>
            h(
              "NuxtLink",
              {
                to: `/users/${row.original.user?.id}`,
                class: "font-medium text-default hover:text-highlighted",
              },
              `${name} ${surname}`,
            ),
        },
      );
    },
  },
  {
    accessorKey: "description",
    header: "Popis",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Suma",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      return formatCurrency(row.getValue("amount") as number);
    },
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
            onUpdated: () => refreshNuxtData("payments"),
          }),
          "aria-label": "Akcie",
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            "aria-label": "Akcie",
          }),
      );
    },
  },
];
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar title="Správa platieb" :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar
          class="flex flex-col md:flex-row items-center justify-between gap-4 max-sm:py-4">
          <UTheme
            :ui="{
              badge: {
                base: 'rounded-full font-bold px-3 text-nowrap',
              },
            }">
            <div
              class="flex flex-row text-base text-muted items-center gap-4 py-2 flex-wrap max-md:justify-center">
              <span>
                Všetky:
                <UBadge size="lg" color="info">
                  {{ paymentStats.allFormatted }}
                </UBadge>
              </span>
              <span>
                Nezaplatené:
                <UBadge size="lg" color="error">
                  {{ paymentStats.unpaidFormatted }} ·
                  {{ paymentStats.unpaidPercentage }}
                </UBadge>
              </span>
              <span>
                Odpustené:
                <UBadge size="lg" color="warning">
                  {{ paymentStats.forgivenFormatted }} ·
                  {{ paymentStats.forgivenPercentage }}
                </UBadge>
              </span>
            </div>
          </UTheme>

          <UButton
            label="Exportovať údaje o platbách"
            to="/api/payments/export"
            download
            target="_blank"
            icon="i-ph-cloud-arrow-down" />
        </UDashboardToolbar>
      </template>
      <template #body>
        <UTable
          :columns="columns"
          :data="paymentsData?.payments"
          class="flex-1" />
      </template>
    </UDashboardPanel>
  </div>
</template>
