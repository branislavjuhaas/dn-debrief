<script setup lang="ts">
import AppDialog from "~/components/dialog/AppDialog.vue";

const loginGoogle = () => {};
const loginGithub = () => {};
</script>

<template>
  <UPageSection>
    <ProseH1>Prihlásenie na platformu DN Cascade</ProseH1>
    <AppDialog>
      <DialogHeader title="Vitajte späť!">
        Nemáte ešte účet?
        <NuxtLink to="/auth/register" class="text-secondary font-medium">
          Zaregistrujte sa!
        </NuxtLink>
      </DialogHeader>
      <div class="flex flex-row gap-3 w-full">
        <UButton
          variant="subtle"
          color="neutral"
          icon="ph:google-logo"
          block
          class="cursor-pointer">
          Google
        </UButton>
        <UButton
          variant="subtle"
          color="neutral"
          icon="ph:github-logo"
          block
          class="cursor-pointer">
          GitHub
        </UButton>
      </div>
    </AppDialog>
  </UPageSection>
</template>

<style scoped></style>
