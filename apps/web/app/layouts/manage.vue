<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();

const predefinedNavigation: (NavigationMenuItem & { roles: UserRole[] })[][] = [
  [
    {
      label: "Správa používateľov",
      icon: "i-ph-users-four",
      to: "/manage/users",
      roles: ["developer", "admin", "chief_adjudicator"],
    },
    {
      label: "Správa klubov",
      icon: "i-ph-city",
      to: "/manage/clubs",
      roles: ["developer", "admin"],
    },
  ],
  [
    {
      label: "Správa podujatí",
      icon: "i-ph-ticket",
      to: "/manage/events",
      roles: [
        "developer",
        "admin",
        "organizer",
        "junior_organizer",
        "chief_adjudicator",
        "motion_committee_member",
      ],
    },
    {
      label: "Tabbycat",
      icon: "i-ph-package",
      trailingIcon: "i-ph-arrow-square-up-right",
      to: "https://tabbycat.sda.sk",
      roles: ["developer", "admin", "chief_adjudicator"],
    },
  ],
  [
    {
      label: "Správa obsahu",
      icon: "i-ph-newspaper-clipping",
      to: "/manage/content",
      roles: ["developer", "admin"],
    },
    {
      label: "Správa platieb",
      icon: "i-ph-coins",
      to: "/manage/payments",
      roles: ["developer", "admin"],
    },
  ],
];

const navigation = computed(() => {
  return predefinedNavigation
    .map((group) =>
      group.filter((item) =>
        item.roles.includes(userStore.user?.role ?? "user"),
      ),
    )
    .filter((group) => group.length > 0);
});
</script>

<template>
  <UDashboardGroup class="relative min-h-[calc(100vh-var(--ui-header-height))]">
    <UDashboardSidebar
      collapsible
      resizable
      class="min-h-[calc(100vh-var(--ui-header-height))]">
      <template #header="{ collapsed }">
        <ULink
          to="/manage"
          class="flex flex-row gap-1.5 text-default items-center rounded-md hover:text-highlighted hover:bg-elevated/50 w-full py-1.5"
          :class="collapsed ? 'justify-center' : 'px-2.5'">
          <UIcon name="i-ph-nut-fill" class="size-5" />
          <h2 v-if="!collapsed" class="text-sm font-bold">Panel správy</h2>
        </ULink>
      </template>
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navigation"
          orientation="vertical" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<style scoped></style>
