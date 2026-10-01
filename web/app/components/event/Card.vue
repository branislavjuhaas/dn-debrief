<script setup lang="ts">
import formatRange from "#shared/utils/format-range";

const props = defineProps<{
  event: FeaturedEvent;
}>();
</script>

<template>
  <NuxtLink
    :to="`/events/${props.event.slug}`"
    class="min-w-[calc(33.33%-0.66rem)] w-96 shrink-0 flex">
    <UCard
      class="event-card w-full shadow hover:bg-muted"
      :ui="{ body: 'sm:p-0' }">
      <div class="aspect-7/3 w-full overflow-hidden">
        <NuxtImg
          :src="
            props.event.thumbnailUrl ||
            `/assets/events/thumbnails/${(props.event.id % 5) + 1}.jpg`
          "
          alt="Event thumbnail"
          class="object-cover aspect-7/3 w-full transition-transform duration-300" />
      </div>

      <template #footer>
        <div class="flex flex-row items-start justify-between">
          <span class="text-sm font-semibold mt-0.5 truncate">
            {{ props.event.name }}
          </span>
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
  transform: scale(1.1);
}
</style>
