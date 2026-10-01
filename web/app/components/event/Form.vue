<script setup lang="ts">
import type { Event } from "#shared/types/event";
import type { TabsItem } from "@nuxt/ui";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { getScheduleBounds, createDefaultEvent } from "#shared/utils/events";

const props = withDefaults(
  defineProps<{
    modelValue?: Partial<Event>;
    mode?: "create" | "edit";
    title?: string;
  }>(),
  {
    modelValue: undefined,
    mode: "create",
    title: undefined,
  },
);

const emit = defineEmits<{
  (e: "saved", event: Event): void;
}>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const mdAndLarger = breakpoints.greaterOrEqual("md");

const detailsEditor = useTemplateRef("detailsEditor");
const registrationConfig = useTemplateRef("registrationConfig");

const toast = useToast();
const isSaving = ref(false);

const { data: userData } = await useFetch("/api/users/me", {
  key: "users-me",
});

// Initialize form model
const eventData = ref<Partial<Event>>(
  props.modelValue
    ? JSON.parse(JSON.stringify(props.modelValue))
    : createDefaultEvent(userData.value?.user?.id),
);

// If modelValue updates externally (e.g. after fetch), sync it
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      eventData.value = JSON.parse(JSON.stringify(newVal));
    }
  },
  { deep: true },
);

const tabs: TabsItem[] = [
  {
    label: "Základné informácie",
    icon: "i-ph-sliders",
    value: "basic",
  },
  {
    label: "Organizátori/-ky",
    icon: "i-ph-users-three",
    value: "organizers",
  },
  {
    label: "Detaily registrácie",
    icon: "i-ph-ticket",
    value: "registration-details",
  },
];

const activeTab = ref("basic");

const saveEvent = async () => {
  if (
    !(await detailsEditor.value?.validate()) ||
    !(await registrationConfig.value?.validate())
  ) {
    toast.add({
      title: "Chýbajúce údaje",
      description:
        "Pred uložením podujatia musíte vyplniť všetky potrebné údaje.",
      color: "error",
    });
    return;
  }

  const raw = eventData.value;
  const scheduleBounds = getScheduleBounds(raw.schedule);

  if (!scheduleBounds || !scheduleBounds.beginning || !scheduleBounds.end) {
    toast.add({
      title: "Neplatný harmonogram podujatia",
      description:
        "Z časového harmonogramu nie je možné určiť začiatok a koniec podujatia. Skontrolujte formát harmonogramu.",
      color: "error",
    });
    return;
  }

  const payload = {
    ...raw,
    motion: raw.type === "tournament" ? raw.motion : undefined,
    targetLeague:
      raw.type === "tournament" ? raw.targetLeague || undefined : undefined,
    targetRegion:
      raw.type === "tournament" ? raw.targetRegion || undefined : undefined,
    beginning: scheduleBounds.beginning.toISOString(),
    end: scheduleBounds.end.toISOString(),
    organizers: raw.organizers?.map((o) => o.id) ?? [],
  };

  isSaving.value = true;

  try {
    if (props.mode === "create") {
      const response = await $fetch<{ event: Event }>("/api/events", {
        method: "POST",
        body: payload,
      });

      toast.add({
        title: "Podujatie vytvorené",
        description: `Podujatie "${response.event.name}" bolo úspešne vytvorené.`,
        color: "success",
      });

      emit("saved", response.event);
      await navigateTo(`/events/${response.event.slug}`);
    } else {
      const slug = props.modelValue?.slug ?? raw.slug;
      const response = await $fetch<{ event: Event }>(`/api/events/${slug}`, {
        method: "PATCH",
        body: payload,
      });

      toast.add({
        title: "Zmeny uložené",
        description: `Podujatie "${response.event.name}" bolo úspešne upravené.`,
        color: "success",
      });

      emit("saved", response.event);
      await navigateTo(`/events/${response.event.slug}`);
    }
  } catch (error: any) {
    toast.add({
      title: "Chyba pri ukladaní",
      description:
        error?.data?.message ||
        `Nastala chyba pri ${props.mode === "create" ? "vytváraní" : "úprave"} podujatia.`,
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="event-editor">
      <template #header>
        <UDashboardNavbar
          :title="
            title ||
            (mode === 'create' ? 'Tvorba podujatia' : 'Úprava podujatia')
          "
          :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>

        <ClientOnly>
          <UDashboardToolbar
            class="flex flex-col md:flex-row max-md:py-2 gap-3 justify-between">
            <UTabs
              v-model="activeTab"
              :items="tabs"
              :content="false"
              :orientation="mdAndLarger ? 'horizontal' : 'vertical'"
              :ui="{ list: 'max-md:w-full' }"
              class="max-md:w-full" />

            <div class="flex items-center gap-2 max-md:w-full">
              <UButton
                :label="
                  mode === 'create' ? 'Vytvoriť podujatie' : 'Uložiť zmeny'
                "
                :loading="isSaving"
                color="primary"
                variant="solid"
                :icon="mode === 'create' ? 'i-ph-checks' : 'i-ph-floppy-disk'"
                :block="!mdAndLarger"
                @click="saveEvent" />
            </div>
          </UDashboardToolbar>
        </ClientOnly>
      </template>

      <template #body>
        <div v-show="activeTab === 'basic'">
          <UPageHeader title="Základné informácie" class="mb-4" />
          <EventDetailsEditor
            ref="detailsEditor"
            v-model="eventData"
            :mode="mode" />
        </div>

        <div v-show="activeTab === 'organizers'">
          <UPageHeader title="Organizátori/-ky" class="mb-4" />
          <EventOrganizers v-model="eventData" />
        </div>

        <div v-show="activeTab === 'registration-details'">
          <UPageHeader title="Detaily registrácie" class="mb-4" />
          <EventRegistrationConfig
            ref="registrationConfig"
            v-model="eventData" />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>
