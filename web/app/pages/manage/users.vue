<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { UserWithRole } from "better-auth/plugins";

definePageMeta({
  middleware: ["auth"],
  allowedRoles: ["developer", "admin", "chief_adjudicator"],
});

useSeoMeta({
  title: "Správa používateľov/-iek",
  description:
    "Prehľad všetkých používateľov/-iek platformy DebRIEF s možnosťou exportu a náhľadu do používateľských profilov.",
});

const { data: stats } = await useFetch("/api/users/stats", {
  key: "users-stats",
});

const authClient = useAuthClient();

const headers = useRequestHeaders(["cookie"]);

const { data: users } = await useAsyncData("users", () =>
  authClient.admin.listUsers({
    query: {
      limit: 7,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    fetchOptions: {
      headers: headers as Record<string, string>,
    },
  }),
);

const UBadge = resolveComponent("UBadge");
const UUser = resolveComponent("UUser");

const columns: TableColumn<UserWithRole>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => `#${row.getValue("id")}`,
  },
  {
    header: "Meno a priezvisko",
    cell: ({ row }) => {
      const name = row.original.name ?? "N/A";
      const surname = (row.original as any).surname ?? "N/A";

      return h(UUser, {
        name: `${name} ${surname}`,
        avatar: {
          src: row.original.image ?? undefined,
          alt: `${name} ${surname}`,
        },
        ui: {
          name: "font-medium text-sm text-primary",
        },
        to: `/users/${row.original.id}`,
        size: "xs",
      });
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email");
      return email ?? "N/A";
    },
  },
  {
    accessorKey: "role",
    header: "Rola",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;

      const color = (role: UserRole) => {
        if (role === "developer" || role === "admin") return "primary";
        if (role === "user") return "info";
        if (role === "chief_adjudicator") return "warning";
        return "info";
      };

      return h(
        UBadge,
        {
          color: color(role),
          variant: "subtle",
        },
        {
          default: () => translateRole(role) ?? "N/A",
        },
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Čas tvorby účtu",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      // format dd. mm. yyyy hh:mm
      return createdAt
        ? new Date(createdAt).toLocaleString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";
    },
  },
];
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar
          title="Správa používateľov/-iek"
          :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar
          class="flex flex-col sm:flex-row items-center justify-end gap-4">
          <UButton
            label="Upraviť nastavenia platformy"
            icon="i-ph-gear-six"
            color="neutral"
            variant="subtle"
            to="/manage/platform"
            class="max-sm:w-full" />
          <UButton
            label="Exportovať údaje"
            to="/api/users/export"
            download
            target="_blank"
            icon="i-ph-cloud-arrow-down"
            class="max-sm:w-full" />
        </UDashboardToolbar>
      </template>
      <template #body>
        <UPageGrid>
          <UCard variant="subtle">
            <div class="font-medium text-muted">
              Všetci/-ky používatelia/-ky
            </div>
            <div class="flex items-center justify-between">
              <div class="text-2xl font-semibold">
                {{ stats?.all }}
              </div>
              <ProgressCircle :value="100" :size="60" :stroke-width="5" />
            </div>
          </UCard>
          <UCard variant="subtle">
            <div class="font-medium text-muted">Kompletné profily</div>
            <div class="flex items-center justify-between">
              <div class="text-2xl font-semibold">
                {{ stats?.completed }}
              </div>
              <ProgressCircle
                :value="
                  Math.round(
                    ((stats?.completed ?? 0) / (stats?.all || 1)) * 100,
                  )
                "
                :size="60"
                :stroke-width="5" />
            </div>
          </UCard>
          <UCard variant="subtle">
            <div class="font-medium text-muted">Členovia/-ky SDA</div>
            <div class="flex items-center justify-between">
              <div class="text-2xl font-semibold">
                {{ stats?.members }}
              </div>
              <ProgressCircle
                :value="
                  Math.round(((stats?.members ?? 0) / (stats?.all || 1)) * 100)
                "
                :size="60"
                :stroke-width="5" />
            </div>
          </UCard>
        </UPageGrid>
        <UTable :data="users?.data?.users" :columns="columns" class="flex-1" />
      </template>
    </UDashboardPanel>
  </div>
</template>
