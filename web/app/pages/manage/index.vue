<script setup lang="ts">
import type { PageCardProps } from "@nuxt/ui";

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const managementViews: (PageCardProps & { roles: UserRole[] })[] = [
  {
    title: "Správa používateľov",
    icon: "i-ph-users-four-bold",
    to: "/manage/users",
    description:
      "Prehľad všetkých používateľov platformy DebRIEF s možnosťou exportu a náhľadu do používateľských profilov.",
    roles: ["developer", "admin", "chief_adjudicator"],
  },
  {
    title: "Správa klubov",
    icon: "i-ph-city-bold",
    to: "/manage/clubs",
    description:
      "Zoznam klubov registrovaných v Slovenskej debatnej asociácii s počtom členov a ostatnými informáciami.",
    roles: ["developer", "admin"],
  },
  {
    title: "Správa podujatí",
    icon: "i-ph-ticket-bold",
    to: "/manage/events",
    description:
      "Paleta podujatí s možnosťou úpravy a tvorby nových podujatí na aktuálnu sezónu.",
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
    title: "Správa obsahu",
    icon: "i-ph-newspaper-clipping-bold",
    to: "/manage/content",
    description:
      "Knižnica dynamicky zadaného obsahu zobrazeného na domovskej stránke platformy DebRIEF.",
    roles: ["developer", "admin"],
  },
  {
    title: "Správa platieb",
    icon: "i-ph-coins-bold",
    to: "/manage/payments",
    description:
      "Správa a štatistické údaje platieb za členstvo v SDA a registrácie na podujatia na platforme DebRIEF. ",
    roles: ["developer", "admin"],
  },
];
const filteredManagementViews = computed(() => {
  const userRole = (userData.value?.user?.role as UserRole) ?? "user";

  return managementViews.filter((item) => item.roles.includes(userRole));
});
</script>

<template>
  <div>
    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar title="Panel správy" :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>
      <template #body>
        <UAlert
          title="TpVSÚPDND SDA ďakuje za vašu prácu pre rozvoj komunity!"
          icon="i-ph-hand-heart-fill"
          color="primary" />
        <UPageGrid>
          <UPageCard
            v-for="item in filteredManagementViews"
            :key="item.to?.toString()"
            variant="subtle"
            v-bind="item" />
        </UPageGrid>
      </template>
    </UDashboardPanel>
  </div>
</template>
