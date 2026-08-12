<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  color?: "success" | "error" | "warning";
}>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }" :title="title">
    <template #body>
      <p v-if="description" class="text-sm text-neutral-500">
        {{ description }}
      </p>
    </template>
    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton
          color="neutral"
          label="Zrušiť"
          variant="subtle"
          block
          @click="emit('close', false)" />
        <UButton
          label="Potvrdiť"
          :color="color ?? 'success'"
          block
          @click="emit('close', true)" />
      </div>
    </template>
  </UModal>
</template>
