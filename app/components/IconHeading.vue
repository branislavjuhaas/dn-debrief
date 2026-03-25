<script setup lang="ts">
defineProps<{
  icon: string;
}>();
</script>

<template>
  <div class="flex flex-row gap-1 items-center">
    <UIcon :name="icon" class="size-5" />
    <h3 class="text-base font-bold">
      <slot />
    </h3>
  </div>
</template>

<style scoped></style>
