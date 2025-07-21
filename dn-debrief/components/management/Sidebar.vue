<template>
  <div
    class="fixed left-0 top-0 flex flex-col h-full justify-between gap-4 bg-white border-r-2 text-black pt-25 pb-20 px-5 overflow-hidden transition-all duration-300 w-15"
    :class="open ? 'md:w-62.5' : ''">
    <div class="flex flex-col gap-8">
      <ManagementSidebarToggleButton :open="open" @toggle="$emit('toggle')" />
      <ManagementSidebarMenu :open="open" />
    </div>
    <NuxtLink
      to="https://casp.sda.sk/studio"
      class="flex flex-row items-center gap-2 hover:text-red w-full">
      <Icon name="ph:table" />
      <span
        class="-mb-1 hidden w-full truncate"
        :class="open ? 'md:inline' : ''">
        Štúdio Supabase
      </span>
      <Icon
        name="ph:arrow-square-up-right"
        class="hidden"
        :class="open ? 'md:inline' : ''" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
}>();
defineEmits(["toggle"]);
</script>
