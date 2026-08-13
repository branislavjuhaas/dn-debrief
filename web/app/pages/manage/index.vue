<script setup lang="ts">
import type { PageCardProps } from "@nuxt/ui";

definePageMeta({
  middleware: [
    "auth",
    async () => {
      const { data: userFetch } = await useFetch("/api/users/me", {
        key: "users-me",
      });

      if (
        userFetch.value?.user?.role === "user" &&
        !userFetch.value?.user?.managedClubs?.length
      ) {
        return false;
      }
    },
  ],
});

useSeoMeta({
  title: "Panel správy",
  description: "Prehľad a správa nastavení a údajov platformy DebRIEF",
});

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const managementViews: (PageCardProps & { roles: UserRole[] })[] = [
  {
    title: "Správa používateľov/-iek",
    icon: "i-ph-users-four-bold",
    to: "/manage/users",
    description:
      "Prehľad všetkých používateľov/-iek platformy DebRIEF s možnosťou exportu a náhľadu do používateľských profilov.",
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

const managedClubs = computed(() => {
  const managedClubs = userData?.value?.user?.managedClubs ?? [];

  return managedClubs.map((club) => ({
    title: `Debatný klub ${club.name}`,
    description: `Správa ${club.isActive ? "aktívneho" : "neaktívneho"} debatného klubu ${club.name}, ktorého ste správcom/-kyňou.`,
    icon: "i-ph-bank-bold",
    to: `/clubs/${club.id}`,
    trailingIcon: "i-ph-arrow-square-up-right",
  }));
});
</script>

<template>
  <div class="w-full h-full">
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
          title="VpVSÚPDND SDA ďakuje za vašu prácu pre rozvoj komunity!"
          icon="i-ph-hand-heart-fill"
          color="primary" />
        <UPageGrid>
          <UPageCard
            v-for="item in filteredManagementViews"
            :key="item.to?.toString()"
            variant="subtle"
            v-bind="item" />
        </UPageGrid>
        <USeparator
          v-if="
            filteredManagementViews.length > 0 && managedClubs.length > 0
          " />
        <UPageGrid>
          <UPageCard
            v-for="item in managedClubs"
            :key="item.to?.toString()"
            :ui="{ leadingIcon: 'text-secondary' }"
            variant="subtle"
            color="secondary"
            v-bind="item" />
        </UPageGrid>
      </template>
    </UDashboardPanel>
  </div>
</template>
