<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Ďakujeme za registráciu",
  description:
    "Ďakujeme za registráciu do Slovenskej debatnej asociácie. Môžete začať využívať všetky výhody členstva.",
});

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");
</script>

<template>
  <UPage>
    <UPageHeader title="Ďakujeme za registráciu" />
    <UPageBody>
      <FormBase
        icon="i-ph-cheers"
        :title="`Vitajte v SDA, ${userData?.user?.name}!`"
        description="Okrem bytia súčasťou niečoho väčšieho, máte možnosť účastniť sa všetkých podujatí SDA a využívať všetky ostatné výhody členstva.">
        <USeparator />
        <div class="grid grid-cols-2 gap-4">
          <UButton to="/" color="neutral" variant="subtle" block>
            Návrat na domovskú stránku
          </UButton>
          <UButton to="/events" block> Navštíviť podujatia </UButton>
        </div>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
