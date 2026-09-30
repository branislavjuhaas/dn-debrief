<script setup lang="ts">
import type { Event } from "#shared/types/event";
import type { CheckboxGroupItem } from "@nuxt/ui";

const model = defineModel<Partial<Event>>({
  default: () => ({}),
});

const organizers = computed<string[]>({
  get: () => model.value?.organizers?.map((o) => String(o.id)) ?? [],
  set: (value) => {
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
  <div class="flex flex-col gap-4">
    <UAlert
      v-if="organizers.length === 0"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle"
      title="Žiadni organizátori"
      description="Podujatie zatiaľ nemá priradeného žiadneho organizátora. Odporúčame vybrať aspoň jednu kontaktnú osobu." />

    <UCheckboxGroup
      v-if="status === 'success'"
      v-model="organizers"
      color="primary"
      variant="card"
      :items="items"
      :ui="{
        fieldset:
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3',
      }" />
    <div
      v-else
      class="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <USkeleton v-for="i in 8" :key="i" class="h-18 rounded-lg" />
    </div>
  </div>
</template>
