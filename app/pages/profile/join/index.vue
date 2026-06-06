<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, RadioGroupItem, SelectMenuItem } from "@nuxt/ui";

definePageMeta({
  middleware: ["auth"],
});

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

const {
  data: availableClubs,
  status,
  error,
} = useLazyFetch("/api/clubs/active", {
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
  registrationType: z.enum([
    "junior_student",
    "senior_student",
    "teacher",
    "graduate",
  ]),
});

type MembershipSchema = z.output<typeof membershipSchema>;

const membershipState = reactive<Partial<MembershipSchema>>({
  clubId: undefined,
  registrationType: lastUserSeason?.registrationType,
});

const requestError = ref<string | null>(null);
const loading = ref(false);

const onSubmit = async (event: FormSubmitEvent<MembershipSchema>) => {
  loading.value = true;
  const data = await $fetch(`/api/clubs/${event.data.clubId}/join`, {
    method: "POST",
    body: {
      registrationType: event.data.registrationType,
    },
    onRequestError: (_error) => {
      loading.value = false;
      requestError.value =
        "Nastala chyba pri registrácii. Skúste to znova neskôr.";
    },
    onResponseError: (error) => {
      loading.value = false;
      if (error.response.status === 404) {
        requestError.value =
          "Nepodarilo sa nájsť debatný klub. Skúste to znova.";
        return;
      }

      requestError.value =
        "Nastala chyba pri registrácii. Skúste to znova neskôr.";
    },
  });

  userStore.addClubMemberships(data.clubMemberships);

  navigateTo("/profile/join/finished");
};
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
          class="space-y-4"
          @submit="onSubmit">
          <LazyUAlert
            v-if="error"
            color="error"
            icon="i-ph-warning-octagon"
            title="Nepodarilo sa načítať aktívne debatné kluby, skúste to znova neskôr." />
          <LazyUAlert
            v-if="requestError"
            color="error"
            icon="i-ph-warning-octagon"
            :title="requestError" />

          <UFormField
            label="Debatný klub"
            description="Najčastejšie škola, kde navštevujete debatný klub">
            <USelectMenu
              v-model="membershipState.clubId"
              value-key="id"
              :items="availableClubs"
              placeholder="Vyberte debatný klub"
              :loading="status === 'pending'"
              :disabled="!!error" />
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

          <UButton :disabled="!!error" :loading="loading" type="submit" block
            >Záväzne sa registrovať do SDA</UButton
          >
        </UForm>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
