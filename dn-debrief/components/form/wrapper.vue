<template>
  <div class="flex flex-col w-full">
    <div class="flex flex-row justify-between items-center px-5">
      <Label class="text-black font-bold">{{ props.title }}</Label>
      <span v-if="props.hint" class="text-gray">{{ props.hint }}</span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { Label } from "reka-ui";

const props = defineProps<{
  title: string;
  hint?: string;
}>();
</script>

<style scoped></style>
