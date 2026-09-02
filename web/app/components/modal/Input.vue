<script setup lang="ts" generic="T extends string | number">
const props = defineProps<{
  title: string;
  description?: string;
  type?: "text" | "number";
  initialValue?: T;
  confirmLabel: string;
}>();

const emit = defineEmits<{
  (e: "close", value: T | undefined): void;
}>();

const model = ref<T | undefined>(props.initialValue);

const numberModel = computed({
  get: () => model.value as number | undefined,
  set: (val) => {
    model.value = val as T;
  },
});

// Bridge 'model' as a string safely for UInput
const stringModel = computed({
  get: () => model.value as string | undefined,
  set: (val) => {
    model.value = val as T;
  },
});
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', undefined) }" :title="title">
    <template #body>
      <p v-if="description" class="text-sm text-neutral-500 mb-4">
        {{ description }}
      </p>

      <UInputNumber
        v-if="props.type === 'number'"
        v-model="numberModel"
        :step-snapping="false"
        :min="0"
        :format-options="{
          minimumFractionDigits: 2,
        }"
        class="w-full" />
      <UInput v-else v-model="stringModel" type="text" />
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
          @click="emit('close', model.value)" />
      </div>
    </template>
  </UModal>
</template>
