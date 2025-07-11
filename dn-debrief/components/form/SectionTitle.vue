<template>
  <div class="flex items-center gap-2">
    <Icon :name="props.icon" />
    <h6 class="text-base font-bold mb-0! mt-1">
      {{ props.title }}
    </h6>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    icon?: string;
  }>(),
  {
    title: "Section Title",
    icon: "ph:question",
  }
);
</script>

<style scoped></style>
