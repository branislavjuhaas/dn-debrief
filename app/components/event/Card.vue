<script setup lang="ts">
import formatRange from "#shared/utils/format-range";
import type { Event } from "#shared/types/event";

const props = defineProps<{
  event: Event;
}>();
</script>

<template>
  <NuxtLink
    :to="`/events/${props.event.slug}`"
    class="min-w-[calc(33.33%-0.66rem)] w-96 shrink-0 flex">
    <UCard
      class="event-card w-full shadow hover:bg-muted"
      :ui="{ body: 'sm:p-0' }">
      <div class="aspect-[7/3] w-full overflow-hidden">
        <NuxtImg
          :src="props.event.thumbnailUrl || '/images/event-placeholder.png'"
          alt="Event thumbnail"
          class="object-cover aspect-[7/3] w-full transition-transform duration-300" />
      </div>

      <template #footer>
        <div class="flex flex-row items-start justify-between">
          <span class="text-sm font-semibold mt-0.5">
            {{ props.event.name }}
          </span>
          <div class="flex flex-row gap-1">
            <!-- TODO: Add badge assignment algorithm -->
            <!-- <UBadge -->
            <!--   v-for="badge in props.badges" -->
            <!--   :key="badge.text" -->
            <!--   :color="badge.color" -->
            <!--   :variant="badge.variant ?? 'subtle'" -->
            <!--   class="text-nowrap"> -->
            <!--   {{ badge.text }} -->
            <!-- </UBadge> -->
          </div>
        </div>
        <span class="text-sm text-muted">
          {{
            formatRange(
              new Date(props.event.beginning),
              new Date(props.event.end),
            )
          }}
          -
          {{ props.event.place }}
        </span>
      </template>
    </UCard>
  </NuxtLink>
</template>

<style scoped>
.event-card:hover :deep(img) {
  transform: scale(1.2);
}
</style>
