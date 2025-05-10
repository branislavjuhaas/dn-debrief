<script setup lang="ts">
const props = defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="gap-4">
    <h1 class="text-white">{{ props.title }}</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-5 p-5 gap-16 transition-all">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
