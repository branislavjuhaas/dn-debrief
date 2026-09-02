<script setup lang="ts" generic="T extends string | number">
const props = defineProps<{
  title: string;
  description?: string;
  type?: "text" | "number";
  initialValue?: T;
  confirmLabel: string;
}>();

// Emit 'close' with the confirmed value (or undefined if cancelled)
const emit = defineEmits<{
  (e: "close", value: T | undefined): void;
}>();

const model = ref<T | undefined>(props.initialValue) as Ref<T | undefined>;
</script>

<template>
  <!-- Emit undefined when the user clicks the top-right X button or backdrop -->
  <UModal :close="{ onClick: () => emit('close', undefined) }" :title="title">
    <template #body>
      <p v-if="description" class="text-sm text-neutral-500 mb-4">
        {{ description }}
      </p>

      <UInputNumber
        v-if="props.type === 'number'"
        v-model="model as number"
        :step-snapping="false"
        :min="0"
        :format-options="{
          minimumFractionDigits: 2,
        }"
        class="w-full" />
      <UInput v-else v-model="model as string" type="text" />
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <UButton
          color="neutral"
          label="Zrušiť"
          variant="subtle"
          block
          @click="emit('close', undefined)" />
        <UButton
          :label="confirmLabel"
          color="success"
          block
          @click="emit('close', model)" />
      </div>
    </template>
  </UModal>
</template>
