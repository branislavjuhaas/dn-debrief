<script setup lang="ts">
const props = defineProps<{
  icon?: string;
  title: string;
  description?: string;
}>();

const slots = defineSlots<{
  default?: () => any;
}>();
</script>

<template>
  <div class="flex flex-col items-center max-w-92">
    <UIcon
      v-if="icon"
      :name="props.icon || ''"
      class="mb-4 sm:mb-6 h-16 w-16" />
    <h2 class="text-xl font-semibold text-center leading-7 text-highlighted">
      {{ title }}
    </h2>
    <p v-if="description || !!slots.default" class="text-center text-muted">
      <slot>
        {{ description }}
      </slot>
    </p>
  </div>
</template>

<style scoped></style>
