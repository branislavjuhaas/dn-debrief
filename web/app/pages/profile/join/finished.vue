<script setup lang="ts">
const route = useRoute();
const verified = route.query.verified === "true";
const error = route.query.error === "true";

useSeoMeta({
  title: !error ? "Ďakujeme za registráciu" : "Chyba pri registrácii",
  description: !error
    ? "Ďakujeme za registráciu do Slovenskej debatnej asociácie. Môžete začať využívať všetky výhody členstva."
    : "Pri potvrdení registrácie došlo k chybe. Prosím, skúste to znova.",
});

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
  enabled: verified,
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");
</script>

<template>
  <UPage>
    <UPageHeader
      :title="!error ? 'Ďakujeme za registráciu' : 'Chyba pri registrácii'" />
    <UPageBody>
      <FormBase
        v-if="!error"
        icon="i-ph-cheers"
        :title="
          verified
            ? 'Registrácia potvrdená'
            : `Vitajte v SDA, ${userData?.user?.name}!`
        "
        :description="`Okrem bytia súčasťou niečoho väčšieho, ${verified ? 'má vaše dieťa' : 'máte'} možnosť účastniť sa všetkých podujatí SDA a využívať všetky ostatné výhody členstva.`">
        <USeparator />
        <div class="flex flex-row items-stretch gap-4">
          <UButton
            to="/"
            :color="verified ? 'primary' : 'neutral'"
            :variant="verified ? 'solid' : 'subtle'"
            block>
            Návrat na domovskú stránku
          </UButton>
          <UButton v-if="!verified" to="/events" block>
            Navštíviť podujatia
          </UButton>
        </div>
      </FormBase>
      <FormBase
        v-else
        icon="i-ph-warning-octagon"
        title="Chyba pri registrácii"
        description="Pri potvrdení registrácie došlo k chybe. Prosím, skúste to znova. Ak problém pretrvá, kontaktujte, prosím, podporu na juhas@sda.sk.">
        <USeparator />
        <div class="flex flex-row items-stretch gap-4">
          <UButton
            to="mailto:juhas@sda.sk"
            color="neutral"
            variant="subtle"
            block>
            Kontaktovať podporu
          </UButton>
          <UButton to="/" block> Návrat na domovskú stránku </UButton>
        </div>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
