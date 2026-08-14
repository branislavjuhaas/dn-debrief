<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

const emit = defineEmits(["close"]);

const schema = z.object({
  name: z
    .string("Názov je povinný údaj")
    .min(2, "Názov musí mať aspoň 2 znaky"),
  league: z.enum(
    ["junior", "senior", "university"],
    "Nesprávna hodnota pre debatný program",
  ),
  region: z.enum(
    ["western", "central", "eastern"],
    "Nesprávna hodnota pre región",
  ),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: undefined,
  league: "senior",
  region: "central",
});

const creatingClub = ref(false);

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  creatingClub.value = true;

  await $fetch("/api/clubs", {
    method: "POST",
    body: event.data,
    onResponseError({ response }) {
      toast.add({
        title: "Nepodarilo sa vytvoriť klub",
        description: "Skontrolujte zadané údaje a skúste to znova.",
        color: "error",
      });
    },
    async onResponse({ response }) {
      if (response.ok) {
        await refreshNuxtData("clubs");
        emit("close");
      }
    },
  });
}
</script>

<template>
  <UModal title="Vytvoriť debatný klub">
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit">
        <UFormField label="Názov" name="name">
          <UInput v-model="state.name" placeholder="Zadajte názov klubu" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Debatný program" name="league">
            <USelect
              v-model="state.league"
              class="w-full"
              :items="[
                {
                  label: 'Základoškolský DP',
                  value: 'junior',
                },
                {
                  label: 'Stredoškolský DP',
                  value: 'senior',
                },
                {
                  label: 'Vysokoškolský DP',
                  value: 'university',
                },
              ]" />
          </UFormField>
          <UFormField label="Región" name="region">
            <USelect
              v-model="state.region"
              class="w-full"
              :items="[
                { label: 'Západoslovenský región', value: 'western' },
                { label: 'Stredoslovenský región', value: 'central' },
                { label: 'Východoslovenský región', value: 'eastern' },
              ]" />
          </UFormField>
        </div>

        <UButton type="submit" block :loading="creatingClub">
          Vytvoriť klub
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>
