<template>
  <div class="flex flex-col w-full pl-0 pr-5 items-start">
    <div
      class="flex flex-col max-w-[calc(50%+660px+0.625rem)] w-full pt-18 pl-20 gap-16 transition-all duration-300"
      :class="open ? 'md:pl-67.5' : ''">
      <ManagementSidebar :open="open" @toggle="open = !open" />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const open = ref(true);
</script>

<style scoped></style>
