<script setup lang="ts">
import type { Event } from "#shared/types/event";

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

const route = useRoute();
const slug = route.params.slug as string;

const { data, error } = await useFetch<{ event: Event }>(
  `/api/events/${slug}`,
  {
    key: `event-edit-${slug}`,
  },
);

if (error.value || !data.value?.event) {
  throw createError({
    statusCode: 404,
    statusMessage: "Podujatie nenájdené",
    message: `Podujatie s ID "${slug}" nebolo nájdené.`,
  });
}

useSeoMeta({
  title: `Úprava podujatia: ${data.value.event.name}`,
  description: `Úprava podujatia ${data.value.event.name}.`,
});
</script>

<template>
  <EventForm
    mode="edit"
    :model-value="data!.event"
    :title="`Úprava: ${data!.event.name}`" />
</template>
