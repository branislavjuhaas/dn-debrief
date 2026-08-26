<script setup lang="ts">
const route = useRoute();
const pending = route.query.pending === "true";
const verified = route.query.verified === "true";
const error = route.query.error === "true";

const getTitle = () => {
  if (error) return "Chyba pri registrácii";
  if (pending) return "Čakáme na potvrdenie";
  if (verified) return "Registrácia úspešne potvrdená";
  return "Registrácia úspešná";
};

const getDescription = () => {
  if (error)
    return "Pri potvrdení registrácie došlo k chybe. Prosím, skúste to znova.";
  if (pending)
    return "Na email vášho zákonného zástupcu bol odoslaný odkaz na potvrdenie registrácie.";
  if (verified)
    return "Okrem bytia súčasťou niečoho väčšieho má vaše dieťa možnosť účastniť sa všetkých podujatí SDA a využívať všetky ostatné výhody členstva.";
  return "Okrem bytia súčasťou niečoho väčšieho máte možnosť účastniť sa všetkých podujatí SDA a využívať všetky ostatné výhody členstva.";
};

const getIcon = () => {
  if (error) return "i-ph-warning-octagon";
  if (pending) return "i-ph-hourglass-medium";
  if (verified) return "i-ph-checks";
  return "i-ph-cheers";
};

useSeoMeta({
  title: getTitle(),
  description: getDescription(),
});

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
  enabled: verified,
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");
</script>

<template>
  <UPage>
    <UPageHeader :title="getTitle()" />
    <UPageBody>
      <FormBase
        :icon="getIcon()"
        :title="
          !pending && !verified && !error
            ? `Vitajte v SDA, ${userData?.user?.name}!`
            : getTitle()
        "
        :description="getDescription()">
        <USeparator />
        <div class="flex flex-row items-stretch gap-4">
          <template v-if="verified || pending">
            <UButton to="/" block> Návrat na domovskú stránku </UButton>
          </template>
          <template v-else-if="error">
            <UButton
              to="mailto:juhas@sda.sk"
              color="neutral"
              variant="subtle"
              block>
              Kontaktovať podporu
            </UButton>
            <UButton to="/" block> Návrat na domovskú stránku </UButton>
          </template>
          <template v-else>
            <UButton to="/" color="neutral" variant="subtle" block>
              Návrat na domovskú stránku
            </UButton>
            <UButton to="/events" block> Navštíviť podujatia </UButton>
          </template>
        </div>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
