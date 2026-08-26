<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, RadioGroupItem, SelectMenuItem } from "@nuxt/ui";

// PAGE METADATA & STORES
definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Registrácia do SDA",
  description:
    "Registrujte sa do Slovenskej debatnej asociácie a získajte prístup k všetkým výhodám členstva.",
});

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

// SEASON DATA FETCHING
const { data: seasons } = await useFetch("/api/settings/seasons", {
  key: "filtered-seasons",
});

if (!seasons?.value?.seasons || seasons?.value?.seasons.length === 0) {
  throw createError({ statusCode: 404, message: "No seasons available" });
}

// CLUB DATA FETCHING & HISTORICAL STATE
// Retrieve user's most recent membership data to pre-populate form values
const lastUserSeason =
  userData.value?.user?.clubMemberships?.sort(
    (a, b) => b.season - a.season,
  )[0] ?? undefined;

const { data: availableClubs, error } = await useFetch("/api/clubs/active", {
  key: "active-clubs",
  getCachedData: (key, nuxtApp) =>
    nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
});

// VALIDATION SCHEMAS & FORM STATE
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
  clubId: z.number("Vyberte debatný klub"),
  registrationType: z.enum(
    ["junior_student", "senior_student", "teacher", "graduate"],
    "Neplatný typ členstva",
  ),
});

type MembershipSchema = z.output<typeof membershipSchema>;

const membershipState = reactive<Partial<MembershipSchema>>({
  clubId: lastUserSeason?.clubId,
  registrationType: lastUserSeason?.registrationType ?? "senior_student",
});

const requestError = ref<string | null>(null);
const pending = ref(false);
const loading = ref(false);

// FORM SUBMISSION HANDLER
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

  await refreshNuxtData("users-me");
  await refreshNuxtData("filtered-seasons");

  if (!data.clubMemberships?.[0]?.confirmed) {
    pending.value = true;
    return;
  }
  navigateTo("/profile/join/finished");
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="`Registrácia do SDA na ${(seasons?.seasons?.length || 0) > 1 ? 'kalendárne roky' : 'kalendárny rok'} ${seasons?.seasons?.join(', ')}`" />

    <UPageBody>
      <FormBase
        title="Členstvo na dosah ruky"
        description="Pre získanie všetkých jeho výhod dokončite, prosím, registráciu">
        <USeparator />

        <UFormField
          label="Osobné údaje"
          description="Registráciou zodpovedáte za správnosť osobných údajov"
          required>
          <ProfileCard :user="userData?.user!">
            <template #footer>
              Nesprávne údaje?
              <ULink to="/profile/edit" class="underline text-primary"
                >Upraviť profil</ULink
              ></template
            >
          </ProfileCard>
        </UFormField>

        <USeparator />

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

          <LazyUAlert
            v-if="pending"
            color="success"
            variant="subtle"
            icon="i-ph-hourglass-medium"
            title="Čakáme na potvrdenie"
            description="Na email vášho zákonného zástupcu bol odoslaný odkaz na potvrdenie registrácie." />

          <UFormField
            label="Debatný klub"
            name="clubId"
            description="Najčastejšie škola, kde navštevujete debatný klub"
            required>
            <USelectMenu
              v-model="membershipState.clubId"
              value-key="id"
              label-key="name"
              :items="availableClubs?.clubs"
              placeholder="Vyberte debatný klub"
              :disabled="!!error" />
          </UFormField>

          <UFormField
            label="Najlepšie ma vystihuje"
            name="registrationType"
            required>
            <URadioGroup
              v-model="membershipState.registrationType"
              :ui="{ fieldset: 'grid grid-cols-2' }"
              indicator="end"
              variant="card"
              default-value="senior_student"
              :items="membershipTypes" />
          </UFormField>

          <UButton :disabled="!!error" :loading="loading" type="submit" block>
            Záväzne sa registrovať do SDA
          </UButton>
        </UForm>
      </FormBase>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
