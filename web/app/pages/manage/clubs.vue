<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { LazyModalCreateClub } from "#components";

definePageMeta({
  middleware: ["auth"],
  allowedRoles: ["developer", "admin"],
});

const { data: clubsFetch } = await useFetch("/api/clubs", {
  key: "clubs",
});

const { data: clubsData } = useNuxtData<typeof clubsFetch.value>("clubs");

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const NuxtLink = resolveComponent("NuxtLink");
const overlay = useOverlay();

const createClub = async () => {
  const modal = overlay.create(LazyModalCreateClub);
  modal.open(LazyModalCreateClub);
};

const columns: TableColumn<Club>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "ID",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Názov",
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
      const clubId = row.getValue("id");
      const clubName = row.getValue("name");

      return h(
        NuxtLink,
        {
          to: `/clubs/${clubId}`,
          class: "text-primary font-medium hover:underline",
        },
        () => clubName,
      );
    },
  },
  {
    accessorKey: "membershipsCount",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Počet členov/-iek",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    meta: {
      class: {
        td: "font-bold text-highlighted",
      },
    },
  },
  {
    accessorKey: "isActive",
    header: "Aktívny",
    cell: ({ row }) => {
      const color = row.getValue("isActive") ? "success" : "error";

      return h(UBadge, { variant: "subtle", color }, () =>
        row.getValue("isActive") ? "Áno" : "Nie",
      );
    },
  },
  {
    accessorKey: "league",
    header: "Debatný program",
    cell: ({ row }) => {
      const leagueValue = {
        junior: "ZDP" as const,
        senior: "SDP" as const,
        university: "VDP" as const,
      }[row.getValue("league") as string];

      const color = {
        junior: "info" as const,
        senior: "olive" as const,
        university: "rose" as const,
      }[row.getValue("league") as string];

      return h(UBadge, { variant: "subtle", color }, () => leagueValue);
    },
  },
  {
    accessorKey: "region",
    header: "Región",
    cell: ({ row }) => {
      const regionValue = {
        western: "Západoslovenský región" as const,
        central: "Stredoslovenský región" as const,
        eastern: "Východoslovenský región" as const,
      }[row.getValue("region") as string];

      const color = {
        western: "olive" as const,
        central: "info" as const,
        eastern: "rose" as const,
      }[row.getValue("region") as string];

      return h(UBadge, { variant: "subtle", color }, () => regionValue);
    },
  },
];
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar
          title="Správa debatných klubov"
          :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar
          class="flex flex-col sm:flex-row items-center justify-end gap-4 max-sm:py-4">
          <span class="text-muted text-sm">
            Počet debatných klubov:
            <span class="font-bold text-highlighted">
              {{ clubsData?.clubs.length || 0 }}
            </span>
          </span>
          <div
            class="grid grid-cols-2 sm:flex flex-row items-center gap-2 max-sm:w-full">
            <UButton
              label="Exportovať údaje"
              to="/api/users/export"
              download
              target="_blank"
              color="neutral"
              variant="subtle"
              icon="i-ph-cloud-arrow-down" />
            <UButton
              label="Vytvoriť klub"
              color="primary"
              variant="solid"
              icon="i-ph-list-plus"
              @click="createClub" />
          </div>
        </UDashboardToolbar>
      </template>
      <template #body>
        <UTable
          :data="
            clubsData?.clubs.sort((a, b) => {
              if (a.isActive !== b.isActive) {
                return b.isActive ? 1 : -1;
              }
              // Sort by id ascending
              return a.id - b.id;
            })
          "
          :columns="columns"
          class="flex-1" />
      </template>
    </UDashboardPanel>
  </div>
</template>
