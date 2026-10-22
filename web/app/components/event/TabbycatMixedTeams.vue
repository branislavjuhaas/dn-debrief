<script setup lang="ts">
import type { ImportPlan } from "#shared/types/tabbycat";
import normalizeString from "#shared/utils/normalize-string";

const props = defineProps<{ teams: ImportPlan["mixedTeams"] }>();
const search = ref("");
const page = ref(1);
const pageSize = 5;
const filteredTeams = computed(() => {
  const query = normalizeString(search.value);
  return query
    ? props.teams.filter((team) =>
        normalizeString([team.name, ...team.members].join(" ")).includes(query),
      )
    : props.teams;
});
const items = computed(() =>
  filteredTeams.value
    .slice((page.value - 1) * pageSize, page.value * pageSize)
    .map((team) => ({
      value: team.name,
      label: team.name,
      members: team.members,
    })),
);

watch(search, () => {
  page.value = 1;
});
watch(
  () => filteredTeams.value.length,
  (count) => {
    page.value = Math.min(page.value, Math.max(1, Math.ceil(count / pageSize)));
  },
);
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-default">
    <div
      v-if="teams.length > pageSize"
      class="flex flex-wrap items-center gap-3 border-b border-default p-3">
      <UInput
        v-model="search"
        aria-label="Vyhľadať zmiešané tímy"
        placeholder="Hľadať tím, člena alebo klub…"
        icon="i-ph-magnifying-glass"
        class="min-w-0 flex-1" />
      <span class="shrink-0 text-xs text-muted" role="status"
        >Nájdené: {{ filteredTeams.length }} / {{ teams.length }}</span
      >
    </div>
    <UAccordion
      v-if="items.length"
      :key="`${search}:${page}`"
      :items="items"
      :ui="{ trigger: 'px-3 py-2.5', body: 'px-3 pb-3' }">
      <template #default="{ item }">
        <span class="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span class="truncate">{{ item.label }}</span>
          <UBadge color="neutral" variant="subtle" size="xs" class="shrink-0"
            >Členovia: {{ item.members.length }}</UBadge
          >
        </span>
      </template>
      <template #body="{ item }">
        <ul class="space-y-1 border-l border-default pl-3 text-muted">
          <li v-for="member in item.members" :key="member" class="break-words">
            {{ member }}
          </li>
        </ul>
      </template>
    </UAccordion>
    <p v-else class="p-4 text-center text-sm text-muted" role="status">
      Žiadne tímy nezodpovedajú vyhľadávaniu.
    </p>
    <div
      v-if="filteredTeams.length > pageSize"
      class="flex flex-wrap items-center justify-between gap-3 border-t border-default p-3">
      <span class="text-xs text-muted"
        >{{ (page - 1) * pageSize + 1 }}–{{
          Math.min(page * pageSize, filteredTeams.length)
        }}
        z {{ filteredTeams.length }}</span
      >
      <UPagination
        v-model:page="page"
        :total="filteredTeams.length"
        :items-per-page="pageSize"
        :sibling-count="0"
        size="xs" />
    </div>
  </div>
</template>
