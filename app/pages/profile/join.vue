<script setup lang="ts">
import * as z from "zod";
import type { RadioGroupItem, SelectMenuItem } from "@nuxt/ui";

const { data: seasons } = await useFetch("/api/settings/seasons");

if (!seasons?.value?.seasons || seasons?.value?.seasons.length === 0) {
  throw createError({ statusCode: 404, message: "No seasons available" });
}

const userStore = useUserStore();

const filteredSeasons = seasons?.value?.seasons?.filter(
  (season) =>
    !userStore.user?.clubMemberships?.some(
      (membership) => membership.season === season,
    ),
);

if (filteredSeasons?.length === 0) {
  throw createError({ statusCode: 404, message: "No seasons available" });
}

const { data: availableClubs, status } = useLazyFetch("/api/clubs/active", {
  transform: (data) =>
    data?.clubs?.map(
      (club) => ({ label: club.name, id: club.id }) as SelectMenuItem,
    ),
  onResponse: () => {
    membershipState.clubId = lastUserSeason?.clubId;
  },
});

const lastUserSeason =
  userStore.user?.clubMemberships?.sort((a, b) => b.season - a.season)[0] ??
  undefined;

const membershipTypes = ref<RadioGroupItem[]>([
  {
    label: "Základoškolský/-á debatér/-ka",
    value: "junior_student",
  },
  {
    label: "Stredoškolský/-á debatér/-ka",
    value: "senior_student",
  },
  {
    label: "Učiteľ/-ka",
    value: "teacher",
  },
  {
    label: "Absolvent/-ka",
    value: "graduate",
  },
]);

const membershipSchema = z.object({
  clubId: z.number(),
  registrationType: z.string(),
});

type MembershipSchema = z.output<typeof membershipSchema>;

const membershipState = reactive<Partial<MembershipSchema>>({
  clubId: undefined,
  registrationType: lastUserSeason?.registrationType,
});
</script>

<template>
  <UPage>
    <UPageHeader
      :title="`Registrácia do SDA na ${(filteredSeasons?.length || 0) > 1 ? 'kalendárne roky' : 'kalendárny rok'} ${filteredSeasons?.join(', ')}`" />
    <UPageBody>
      <FormBase>
        <UForm
          :schema="membershipSchema"
          :state="membershipState"
          class="space-y-4">
          <UFormField
            label="Debatný klub"
            description="Najčastejšie škola, kde navštevujete debatný klub">
            <USelectMenu
              v-model="membershipState.clubId"
              value-key="id"
              :items="availableClubs"
              :loading="status === 'pending'" />
          </UFormField>
          <UFormField
            label="Typ registráce"
            description="Vyberte, prosím, čo vás najviac vystihuje">
            <URadioGroup
              v-model="membershipState.registrationType"
              :ui="{ fieldset: 'grid grid-cols-2' }"
              indicator="end"
              variant="card"
              default-value="senior_student"
              :items="membershipTypes" />
          </UFormField>

          <UButton block>Záväzne sa registrovať do SDA</UButton>
        </UForm>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
