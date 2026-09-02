<script setup lang="ts">
const emit = defineEmits<{
  (
    e: "close",
    value: { amount: number; description: string } | undefined,
  ): void;
}>();

const amount = ref<number>(0);
const description = ref<string>("");

const handleConfirm = () => {
  emit("close", {
    amount: amount.value,
    description: description.value,
  });
};
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', undefined) }"
    title="Vytvoriť platbu">
    <template #body>
      <UFormField label="Poznámka">
        <UInput v-model="description" />
      </UFormField>
      <UFormField label="Suma v EUR" class="mt-4">
        <UInputNumber
          v-model="amount"
          :min="0"
          :format-options="{
            minimumFractionDigits: 2,
          }"
          class="w-full" />
      </UFormField>
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
          label="Vytvoriť"
          color="success"
          block
          @click="handleConfirm" />
      </div>
    </template>
  </UModal>
</template>
