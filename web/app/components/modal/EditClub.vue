<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

const props = defineProps<{
  club: Club;
}>();

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
  isActive: z.boolean("Nesprávna hodnota pre stav klubu"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: props.club.name,
  league: props.club.league,
  region: props.club.region,
  isActive: props.club.isActive,
});

const editingClub = ref(false);

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  editingClub.value = true;

  await $fetch(`/api/clubs/${props.club.id}`, {
    method: "PATCH",
    body: event.data,
    onResponseError({ response }) {
      toast.add({
        title: "Nepodarilo sa upraviť klub",
        description: "Skontrolujte zadané údaje a skúste to znova.",
        color: "error",
      });
    },
    async onResponse({ response }) {
      if (response.ok) {
        await refreshNuxtData(`clubs-${props.club.id}`);
        await refreshNuxtData("clubs");
        emit("close");
      }
    },
  });
}
</script>

<template>
  <UModal title="Upraviť debatný klub">
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
        <USeparator />
        <UCheckbox
          v-model="state.isActive"
          label="Aktívny klub"
          description="Ak je klub neaktívny, nebude možné stať sa jeho členom/-kou"
          :true-value="true"
          :false-value="false" />

        <UButton type="submit" block autol> Uložiť zmeny </UButton>
      </UForm>
    </template>
  </UModal>
</template>
