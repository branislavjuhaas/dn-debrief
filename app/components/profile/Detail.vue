<script setup lang="ts">
defineProps<{
  label: string;
  value?: string | number | null;
  icon?: string;
}>();
</script>

<template>
  <span class="space-x-2 text-sm items-center flex">
    <UIcon :name="icon" class="size-5" />
    {{ label }}:&nbsp;
    <b v-if="value">{{ value }}</b>
    <span v-else class="text-dimmed">chýba</span>
  </span>
</template>
