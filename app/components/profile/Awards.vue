<script setup lang="ts">
import { computed } from "vue";
import type { Award } from "#shared/types/user";

const props = defineProps<{
  userAwards?: Award[];
}>();

// Clean, mutation-safe deduplication map
const filteredAwards = computed(() => {
  if (!props.userAwards) return [];

  const maxLevelMap = new Map<string, Award>();

  for (const award of props.userAwards) {
    const existing = maxLevelMap.get(award.award);
    if (!existing || award.level > existing.level) {
      maxLevelMap.set(award.award, { ...award });
    }
  }

  // Convert map to array and sort descending (highest level first)
  return Array.from(maxLevelMap.values()).sort((a, b) => b.level - a.level);
});

// Map levels to Tailwind classes to eliminate the nested ternary
const levelStyles: Record<number, string> = {
  1: "text-amber-700 bg-amber-700/10 border-amber-700/25",
  2: "text-zinc-500 bg-zinc-500/10 border-zinc-500/25",
  3: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25",
  4: "text-sky-500 bg-sky-500/10 border-sky-500/25",
};
</script>

<template>
  <UCard class="min-w-100">
    <template #header>
      <div class="flex flex-row justify-between items-center">
        <span class="text-sm font-bold">Ocenenia</span>
        <UButton
          to="/awards"
          trailing-icon="i-ph-arrow-square-up-right"
          size="xs"
          variant="subtle">
          Zistiť viac
        </UButton>
      </div>
    </template>

    <div v-if="filteredAwards.length" class="flex flex-wrap gap-1">
      <UTooltip
        v-for="award in filteredAwards"
        :key="award.award"
        :delay-duration="0"
        :text="getAward(award.award).levels[award.level - 1]?.title">
        <ULink
          :to="`/awards?detail=${award.award}`"
          class="flex items-center w-min p-2 border rounded-2xl transition-colors duration-200"
          :class="levelStyles[award.level]">
          <UIcon :name="getAward(award.award).icon" class="size-6" />
        </ULink>
      </UTooltip>
    </div>

    <span v-else class="text-sm text-muted">
      Zatiaľ nemáte žiadne ocenenia.
    </span>
  </UCard>
</template>
