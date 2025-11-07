<script setup lang="ts">
import { createAuthClient } from "better-auth/vue";
import AppDialog from "~/components/dialog/AppDialog.vue";

definePageMeta({
  guest: true,
});

const authClient = createAuthClient();
const userStore = useUserStore();

const authError = ref("");

const loginGithub = async () => {
  await authClient.signIn.social(
    { provider: "github" },
    {
      onSuccess: (ctx) => {
        userStore.set(ctx.data.user);
      },
      onError: (err) => {
        authError.value = err.error.message || "Social login failed";
      },
    },
  );
};

const loginGoogle = async () => {
  await authClient.signIn.social(
    { provider: "google" },
    {
      onSuccess: (ctx) => {
        userStore.set(ctx.data.user);
      },
      onError: (err) => {
        authError.value = err.error.message || "Social login failed";
      },
    },
  );
};
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
          @click="loginGoogle"
          variant="subtle"
          color="neutral"
          icon="ph:google-logo"
          block
          class="cursor-pointer">
          Google
        </UButton>
        <UButton
          @click="loginGithub"
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
