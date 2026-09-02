<script setup lang="ts">
import LazyModalInput from "~/components/modal/Input.vue";
import { LazyModalResolvePayments } from "#components";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
  allowedRoles: ["developer", "admin"],
});

useSeoMeta({
  title: "Správa platieb",
  description:
    "Správa a štatistické údaje platieb za členstvo v SDA a registrácie na podujatia na platforme DebRIEF. ",
});

const { data: paymentsFetch } = await useFetch("/api/payments", {
  key: "payments",
});

const { data: paymentsData } =
  useNuxtData<typeof paymentsFetch.value>("payments");

const UBadge = resolveComponent("UBadge");
const UUser = resolveComponent("UUser");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const overlay = useOverlay();

const currencyFormatter = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
});

const columns: TableColumn<{
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
}>[] = [
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
      return currencyFormatter.format((row.getValue("amount") as number) / 100);
    },
  },
  {
    accessorKey: "status",
    header: "Stav platby",
    cell: ({ row }) => {
      const colorMap: Record<
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

      const color = colorMap[row.original.status] ?? "neutral";

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
          items: getRowItems(row),
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

const toast = useToast();

const getRowItems = (row: any) => {
  return [
    {
      label: "Detail",
      icon: "i-ph-file-text",
      to: `/manage/payments/${row.original.id}`,
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
          },
          onResponse: () => {
            refreshNuxtData("payments");
          },
        });
      },
    },
    {
      label: "Zmeniť stav",
      icon: "i-ph-seal-check",
      onSelect: async () => {
        const modal = overlay.create(LazyModalResolvePayments);
        const instance = modal.open({
          initialValue: row.original.status,
        });

        const result = await instance.result;

        if (!result) return;

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
          },
          onResponse: async ({ response }) => {
            if (!response.ok) return;

            await refreshNuxtData(`payments`);
          },
        });
      },
    },
  ];
};
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
                  {{ Number(paymentsData?.stats.all ?? 0) / 100 }} €
                </UBadge>
              </span>
              <span>
                Nezaplatené:
                <UBadge size="lg" color="error">
                  {{ Number(paymentsData?.stats.unpaid ?? 0) / 100 }} € ·
                  {{
                    (
                      (Number(paymentsData?.stats.unpaid ?? 0) /
                        Number(paymentsData?.stats.all ?? 0)) *
                      100
                    ).toFixed(2)
                  }}
                  %
                </UBadge>
              </span>
              <span>
                Odpustené:
                <UBadge size="lg" color="warning">
                  {{ Number(paymentsData?.stats.forgiven ?? 0) / 100 }} € ·
                  {{
                    (
                      (Number(paymentsData?.stats.forgiven ?? 0) /
                        Number(paymentsData?.stats.all ?? 0)) *
                      100
                    ).toFixed(2)
                  }}
                  %
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
