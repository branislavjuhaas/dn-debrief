<script setup lang="ts">
import type { Event } from "#shared/types/event";
import type { TabsItem } from "@nuxt/ui";
import z from "zod";

const detailsEditor = useTemplateRef("detailsEditor");

const { data: userData } = await useFetch("/api/users/me", {
  key: "users-me",
});

const newEvent = ref<Partial<Event>>({
  slug: "",
  name: "",
  type: "tournament",
  description: "",
  thumbnailUrl: undefined,
  beginning: undefined,
  end: undefined,
  targetLeague: undefined,
  targetRegion: undefined,
  place: undefined,
  address: undefined,
  motion: undefined,
  schedule: {
    days: [
      {
        date: "2026-09-19",
        schedule: [
          {
            beginning: 780, // 13:00 expressed in minutes from midnight (13 * 60)
            duration: 30, // Duration in minutes (13:00 to 13:30)
            text: "Otvorenie podujatia",
          },
        ],
      },
    ],
  },
  registrationConfig: {
    deadline: undefined,
    href: undefined,
  },
  organizers: [
    {
      id: (userData.value?.user?.id ?? 0).toString(),
    },
  ],
});

const createEvent = async () => {
  if (!(await detailsEditor.value!.validate())) {
    return;
  }
};

const items = [
  {
    label: "Základné informácie",
    icon: "i-ph-sliders",
    value: "basic",
  },
  { label: "Organizátori/-ky", icon: "i-ph-users-three", value: "organizers" },
  {
    label: "Detaily registrácie",
    icon: "i-ph-ticket",
    value: "registration-details",
  },
];

const activeTab = ref("basic");
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar title="Tvorba podujatia" :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar>
          <UTabs v-model="activeTab" :items="items" :content="false" />
          <UButton
            label="Vytvoriť podujatie"
            color="primary"
            variant="solid"
            icon="i-ph-checks"
            @click="createEvent" />
        </UDashboardToolbar>
      </template>
      <template #body>
        <div v-if="activeTab === 'basic'">
          <UPageHeader title="Základné informácie" class="mb-4" />
          <EventDetailsEditor ref="detailsEditor" v-model="newEvent" />
        </div>
        <div v-else-if="activeTab === 'organizers'">
          <UPageHeader title="Organizátori/-ky" class="mb-4" />
          <EventOrganizers v-model="newEvent" />
        </div>
        <div v-else-if="activeTab === 'registration-details'">
          <UPageHeader title="Detaily registrácie" class="mb-4" />
          <EventRegistrationConfig v-model="newEvent" />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>
