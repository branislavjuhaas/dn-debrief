<script setup lang="ts">
import type { Event } from "#shared/types/event";
import type { CheckboxGroupItem } from "@nuxt/ui";

const model = defineModel<Partial<Event>>({
  default: () => ({}),
});

const organizers = computed<string[]>({
  get: () => model.value?.organizers?.map((o) => String(o.id)) ?? [],
  set: (value) => {
    if (value.length < 1) return;

    model.value = {
      ...model.value,
      organizers: value.map((id) => ({ id: Number(id) })),
    };
  },
});

const { data: organizersData, status } = await useFetch(
  "/api/events/organizers",
  {
    key: "organizers",
    getCachedData: (key) => useNuxtData(key).data.value,
  },
);

const items = computed<CheckboxGroupItem[]>(
  () =>
    organizersData.value?.organizers?.map((o) => ({
      label: `${o.name} ${o.surname}`,
      value: o.id.toString(),
      description: o.email,
    })) ?? [],
);
</script>

<template>
  <UCheckboxGroup
    v-if="status === 'success'"
    v-model="organizers"
    color="primary"
    variant="card"
    :items="items"
    :ui="{
      fieldset: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    }" />
  <div
    v-else
    class="gap-x-2 gap-y-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <USkeleton v-for="i in 11" :key="i" class="h-17.5" />
  </div>
</template>
