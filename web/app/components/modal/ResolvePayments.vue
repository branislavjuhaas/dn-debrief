<script setup lang="ts">
import type { SelectItem } from "@nuxt/ui";

const props = defineProps<{
  initialValue?: PaymentStatus;
}>();

const emit = defineEmits<{
  (
    e: "close",
    value: { status: PaymentStatus; note?: string } | undefined,
  ): void;
}>();

const model = ref<PaymentStatus | undefined>(props.initialValue);
const note = ref<string | undefined>(undefined);

const items = ref<SelectItem[]>([
  { label: "Zaplatená", value: "paid" },
  { label: "Odpustená", value: "forgiven" },
  { label: "Zlyhala", value: "failed" },
  { label: "Čakajúca", value: "pending", disabled: true, class: "hidden" },
  { label: "Spracúvaná", value: "processing", disabled: true, class: "hidden" },
  { label: "Zrušená", value: "cancelled", disabled: true, class: "hidden" },
]);

const handleConfirm = () => {
  if (!model.value) return;
  emit("close", {
    status: model.value,
    note: note.value,
  });
};
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', undefined) }"
    title="Zmeniť stav platby">
    <template #body>
      <p class="text-sm text-neutral-500 mb-4">
        Zadajte, prosím, nový stav pre zvolené platby a vyberte poznámku.
      </p>

      <UFormField label="Stav platby" required>
        <USelect v-model="model" :items="items" class="w-full" />
      </UFormField>
      <UFormField label="Poznámka">
        <UInput v-model="note" />
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
          label="Potvrdiť"
          color="success"
          block
          @click="handleConfirm" />
      </div>
    </template>
  </UModal>
</template>
