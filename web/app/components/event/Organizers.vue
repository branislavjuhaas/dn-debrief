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

const { data: organizersData } = await useFetch("/api/events/organizers", {
  key: "organizers",
});

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
    v-model="organizers"
    color="primary"
    variant="card"
    :items="items"
    :ui="{
      fieldset: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    }" />
</template>
