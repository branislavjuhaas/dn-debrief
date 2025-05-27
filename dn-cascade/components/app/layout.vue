<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="flex flex-col gap-4 w-full px-5">
    <h1>{{ props.title }}</h1>
    <slot />
  </div>
</template>

<style scoped></style>
