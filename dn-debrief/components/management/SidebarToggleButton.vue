<template>
  <button
    @click="$emit('toggle')"
    class="flex flex-row items-center justify-between gap-2">
    <div class="flex flex-row items-center gap-2">
      <Icon name="ph:nut-fill" />
      <span
        class="hidden text-base font-bold -mb-1 uppercase text-nowrap"
        :class="open ? 'md:block' : ''">
        Panel správy
      </span>
    </div>
    <Icon
      name="ph:text-outdent"
      class="hidden cursor-pointer"
      :class="open ? 'md:block' : ''" />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
}>();
defineEmits(["toggle"]);
</script>
