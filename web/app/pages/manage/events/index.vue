<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  layout: "manage",
  middleware: ["auth"],
  allowedRoles: [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ],
});

useSeoMeta({
  title: "Správa podujatí",
  description: "Zoznam všetkých debatných podujatí, turnajov a seminárov.",
});

const page = ref(1);
const pageSize = ref(15);

const {
  data: eventsData,
  refresh,
  status,
} = await useFetch("/api/events", {
  key: "manage-events",
  query: {
    page,
    pageSize,
  },
});

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const NuxtLink = resolveComponent("NuxtLink");

type EventItem = {
  id: number;
  slug: string;
  name: string;
  type?: string;
  place?: string | null;
  beginning: string;
  end: string;
  thumbnailUrl?: string | null;
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const columns: TableColumn<EventItem>[] = [
  {
    accessorKey: "name",
    header: "Názov podujatia",
    cell: ({ row }) => {
      const slug = row.original.slug;
      const name = row.original.name;

      return h(
        NuxtLink,
        {
          to: `/events/${slug}`,
          class: "font-medium text-primary hover:underline",
        },
        () => name,
      );
    },
  },
  {
    accessorKey: "type",
    header: "Typ",
    cell: ({ row }) => {
      const type = row.original.type;
      const map: Record<
        string,
        { label: string; color: "primary" | "info" | "neutral" }
      > = {
        tournament: { label: "Turnaj", color: "primary" },
        workshop: { label: "Seminár", color: "info" },
        other: { label: "Iné", color: "neutral" },
      };
      const info = map[type ?? "other"] ?? { label: "Iné", color: "neutral" };
      return h(
        UBadge,
        { variant: "subtle", color: info.color },
        () => info.label,
      );
    },
  },
  {
    accessorKey: "beginning",
    header: "Termín",
    cell: ({ row }) => {
      const b = formatDate(row.original.beginning);
      const e = formatDate(row.original.end);
      return b === e ? b : `${b} – ${e}`;
    },
  },
  {
    accessorKey: "place",
    header: "Miesto",
    cell: ({ row }) => row.original.place || "—",
  },
  {
    id: "actions",
    header: "Akcie",
    cell: ({ row }) => {
      const slug = row.original.slug;
      return h(UButton, {
        to: `/manage/events/${slug}/edit`,
        icon: "i-ph-pencil-simple",
        color: "primary",
        variant: "subtle",
        size: "xs",
        label: "Upraviť",
      });
    },
  },
];
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="events-panel">
      <template #header>
        <UDashboardNavbar title="Správa podujatí" :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar
          class="flex flex-col sm:flex-row items-center justify-between gap-4 max-sm:py-4">
          <span class="text-muted text-sm">
            Celkový počet podujatí:
            <span class="font-bold text-highlighted">
              {{ eventsData?.pagination.total ?? 0 }}
            </span>
          </span>
          <div class="flex items-center gap-2">
            <UButton
              label="Vytvoriť podujatie"
              to="/manage/events/new"
              color="primary"
              variant="solid"
              icon="i-ph-plus" />
          </div>
        </UDashboardToolbar>
      </template>

      <template #body>
        <div class="space-y-4">
          <UTable
            :data="eventsData?.events ?? []"
            :columns="columns"
            :loading="status === 'pending'"
            class="w-full" />

          <div
            v-if="(eventsData?.pagination.totalPages ?? 0) > 1"
            class="flex justify-end pt-4">
            <UPagination
              v-model:page="page"
              :total="eventsData?.pagination.total ?? 0"
              :items-per-page="pageSize" />
          </div>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>
