<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const authClient = useAuthClient();
const userStore = useUserStore();

const error = ref<string | null>(null);
const submitting = ref<boolean>(false);

const loginSchema = z.object({
  email: z.email("Neplatný email"),
  password: z.string("Zadajte heslo"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.output<typeof loginSchema>;

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
    label: "Password",
    type: "password",
    placeholder: "Zadajte heslo ",
    required: true,
  },
  {
    name: "remember",
    label: "Zapamäť prihlásenie",
    type: "checkbox",
  },
];

// Refresh store user from server after successful sign-in.
const loadCurrentUser = async () => {
  const { user } = await $fetch("/api/users/me");

  if (!user) {
    error.value = translateAuthError("UNKNOWN_ERROR");
    return;
  }

  await userStore.$patch({
    user,
  });
}

const emailLogin = (payload: FormSubmitEvent<LoginFormData>) => {
  submitting.value = true;
  error.value = null;

  authClient.signIn.email(
    {
      email: payload.data.email,
      password: payload.data.password,
      remember: payload.data.remember,
    },
    {
      onSuccess: async () => {
        await loadCurrentUser();
        submitting.value = false;
        navigateTo("/");
      },
      onError: (ctx: { error: { code: string } }) => {
        error.value = translateAuthError(ctx.error.code);
        submitting.value = false;
      },
    },
  );
}

const githubLogin = async () => {
  submitting.value = true;
  error.value = null;

  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/",
  });
}

const googleLogin = async () => {
  // TODO: Implement Google login
}

const providers = computed(() => [
  {
    label: "Google",
    icon: "i-ph-google-logo",
    disabled: submitting.value,
    onClick: () => googleLogin(),
  },
  {
    label: "GitHub",
    icon: "i-ph-github-logo",
    disabled: submitting.value,
    onClick: () => githubLogin(),
  },
]);
</script>

<template>
  <UPage>
    <UPageHeader title="Prihlásenie na platformu DebRIEF" />
    <UPageBody>
      <FormBase title="Vitajte späť">
        <template #description>
          Nemáte ešte účet?
          <ULink to="/auth/register" class="text-secondary"
            >Vytvoriť nový.</ULink
          >
        </template>
        <UAuthForm
          :schema="loginSchema"
          :fields="fields"
          :providers="providers"
          separator="alebo"
          :ui="{
            providers: 'flex flex-col lg:flex-row space-y-0 gap-2',
          }"
          :loading="submitting"
          @submit="emailLogin">
          <template #password-hint>
            <ULink
              to="/auth/forgot-password"
              class="text-secondary font-medium"
              tabindex="-1"
              >Zabudli ste heslo?</ULink
            >
          </template>
          <template #validation>
            <UAlert
              v-if="error"
              color="error"
              icon="i-ph-warning-octagon"
              :title="error" />
          </template>
        </UAuthForm>
        <template #footer>
          Prihlásením súhlasíte s
          <ULink to="/terms-of-service" class="underline"
            >podmienkamy používania.</ULink
          >
        </template>
      </FormBase>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
