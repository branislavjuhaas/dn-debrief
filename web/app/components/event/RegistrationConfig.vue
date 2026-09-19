<script setup lang="ts">
import type { Event } from "#shared/types/event";

const model = defineModel<Partial<Event>>({
  default: () => ({}),
});
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <UPageCard
      orientation="horizontal"
      description="Platforma DebRIEF teraz ponúka možnosť registrácie na podujatia priamo v systéme s možnosťou platieb za registráciu, úpravy údajov a ich exportu.">
      <template #title>
        Zbierať registrácie priamo v DebRIEF-e?
        <!-- <UBadge size="lg" variant="subtle" color="warning" class="-mt-3 ml-2">
          Experimentálne
        </UBadge> -->
        <UBadge size="lg" variant="subtle" color="error" class="-mt-3 ml-2">
          Neimplementované
        </UBadge>
      </template>
      <template #footer>
        <USwitch label="Centrálny zber registrácií" disabled />
      </template>
      <div
        class="flex h-full w-full lg:min-h-36 overflow-hidden relative rounded-lg max-lg:hidden opacity-70">
        <NuxtImg
          src="/assets/registrations-banner.jpg"
          class="absolute w-full ml-auto object-cover object-top grayscale" />
      </div>
    </UPageCard>
  </div>
</template>
