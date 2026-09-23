<script setup lang="ts">
import type { Event } from "#shared/types/event";

const props = defineProps<{ event: Event }>();

const formatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
  timeStyle: "short",
});
</script>

<template>
  <UCard :ui="{ body: 'p-0 sm:p-0 grid lg:grid-cols-[auto_1fr]' }">
    <div class="aspect-7/3 overflow-hidden h-full max-h-full!">
      <NuxtImg
        :src="
          props.event.thumbnailUrl ||
          `/assets/events/thumbnails/${(props.event.id % 5) + 1}.jpg`
        "
        alt="Event thumbnail"
        class="object-cover aspect-7/3 h-full transition-transform duration-300" />
    </div>
    <div class="flex flex-col gap-2 px-5 py-4 w-full">
      <ProfileDetail
        icon="i-ph-map-trifold-fill"
        label="Kde"
        :value="event.address" />
      <ProfileDetail
        icon="i-ph-watch-fill"
        label="Kedy"
        :value="formatRange(new Date(event.beginning), new Date(event.end))" />
      <ProfileDetail
        icon="i-ph-coins-fill"
        label="Koľko"
        :value="`${event.registrationConfig.cost ?? 0}€`" />
      <ProfileDetail
        icon="i-ph-warning-octagon-fill"
        label="Deadline"
        :value="
          formatter.format(new Date(event.registrationConfig.deadline))
        " />
      <span class="flex flex-row gap-2">
        <ProfileDetail
          icon="i-ph-quotes-fill"
          label="Téza"
          :value="event.motion?.text" />
        <NuxtLink
          v-if="event.motion?.href"
          :to="event.motion?.href"
          class="leading-none">
          <UBadge
            label="Rozbor tézy"
            trailing-icon="i-ph-arrow-square-up-right"
            color="info"
            variant="subtle"
            size="sm" />
        </NuxtLink>
      </span>
    </div>
  </UCard>
</template>
