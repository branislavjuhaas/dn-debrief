<script setup lang="ts">
import type { Event } from "#shared/types/event";
import type { TabsItem } from "@nuxt/ui";
import z from "zod";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const mdAndLarger = breakpoints.greaterOrEqual("md");

const detailsEditor = useTemplateRef("detailsEditor");
const registrationConfig = useTemplateRef("registrationConfig");

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
    deadline: new Date().toISOString(),
    href: undefined,
  },
  organizers: [
    {
      id: userData.value?.user?.id ?? 0,
    },
  ],
});

const toast = useToast();

const createEvent = async () => {
  if (
    !(await detailsEditor.value!.validate()) ||
    !(await registrationConfig.value!.validate())
  ) {
    toast.add({
      title: "Chýbajúce údaje",
      description:
        "Pred vytvorením podujatia musíte vyplniť všetky potrebné údaje.",
      color: "error",
    });
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
        <ClientOnly>
          <UDashboardToolbar class="flex flex-col md:flex-row max-md:py-2">
            <UTabs
              v-model="activeTab"
              :items="items"
              :content="false"
              :orientation="mdAndLarger ? 'horizontal' : 'vertical'"
              :ui="{ list: 'max-md:w-full' }"
              class="max-md:w-full" />
            <UButton
              label="Vytvoriť podujatie"
              color="primary"
              variant="solid"
              icon="i-ph-checks"
              @click="createEvent"
              :block="!mdAndLarger" />
          </UDashboardToolbar>
        </ClientOnly>
      </template>
      <template #body>
        <div v-show="activeTab === 'basic'">
          <UPageHeader title="Základné informácie" class="mb-4" />
          <EventDetailsEditor ref="detailsEditor" v-model="newEvent" />
        </div>
        <div v-show="activeTab === 'organizers'">
          <UPageHeader title="Organizátori/-ky" class="mb-4" />
          <EventOrganizers v-model="newEvent" />
        </div>
        <div v-show="activeTab === 'registration-details'">
          <UPageHeader title="Detaily registrácie" class="mb-4" />
          <EventRegistrationConfig
            ref="registrationConfig"
            v-model="newEvent" />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>
