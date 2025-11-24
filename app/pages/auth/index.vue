<script setup lang="ts">
import { createAuthClient } from "better-auth/vue";
import AppDialog from "~/components/dialog/AppDialog.vue";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import * as z from "zod";
import useAuthError from "~/utils/use-auth-error";

/** Gate the route to unauthenticated visitors. */
definePageMeta({
  guest: true,
});

/** Basic SEO metadata for the login screen. */
useSeoMeta({
  title: "Prihlásenie",
});

const authClient = createAuthClient();
const userStore = useUserStore();

/** Field configuration consumed by `UAuthForm`. */
const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Zadajte email",
    required: true,
  },
  {
    name: "password",
    label: "Heslo",
    type: "password",
    placeholder: "Zadajte heslo",
    required: true,
  },
  {
    name: "remember",
    label: "Zapamätať",
    type: "checkbox",
  },
];

/** Validation schema for the login payload. */
const schema = z.object({
  email: z.email("Neplatná emailová adresa"),
  password: z.string("Heslo je povinné"),
  remember: z.boolean().optional(),
});
/** Output type inferred from `schema`. */
type Schema = z.output<typeof schema>;

/** Reactive error message piped into the alert. */
const authError = ref<string>("");

/**
 * Handles the GitHub social login flow.
 * In success, it updates the user store with the user data.
 * On error, it sets an appropriate error message.
 */
const loginGithub = async () => {
  await authClient.signIn.social(
    { provider: "github" },
    {
      onSuccess: (ctx) => {
        userStore.set(ctx.data.user);
      },
      onError: (_err) => {
        authError.value = "Prihlásenie pomocou GitHub zlyhalo";
      },
    },
  );
};

/**
 * Handles the Google social login flow.
 * In success, it updates the user store with the user data.
 * On error, it sets an appropriate error message.
 */
const loginGoogle = async () => {
  await authClient.signIn.social(
    { provider: "google" },
    {
      onSuccess: (ctx) => {
        userStore.set(ctx.data.user);
      },
      onError: (_err) => {
        authError.value = "Prihlásenie pomocou Google zlyhalo";
      },
    },
  );
};

/**
 * Handles the email and password login flow.
 * @param {FormSubmitEvent<Schema>} payload - The form submission event data.
 */
const loginPassword = async (payload: FormSubmitEvent<Schema>) => {
  const { data, error } = await authClient.signIn.email({
    email: payload.data.email,
    password: payload.data.password,
    rememberMe: payload.data.remember,
    callbackURL: "/",
  });

  if (error || !data) {
    authError.value = useAuthError(error.code);
    return;
  }

  userStore.set(data.user);
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
      <USeparator>alebo</USeparator>
      <UAuthForm :schema="schema" :fields="fields" @submit="loginPassword">
        <template #password-hint>
          <NuxtLink to="/auth/forgot" class="text-secondary font-medium">
            Zabudli ste heslo?
          </NuxtLink>
        </template>
        <template #validation>
          <UAlert
            v-if="authError != ''"
            color="error"
            icon="ph:warning-octagon-fill"
            :title="authError" />
        </template>
      </UAuthForm>
    </AppDialog>
  </UPageSection>
</template>

<style scoped></style>
