<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

definePageMeta({
  middleware: ["anonymous"],
});

useSeoMeta({
  title: "Prihlásenie",
  description:
    "Prihláste se na platformu DebRIEF a začněte využívať všetky jej funkcie.",
});

const authClient = useAuthClient();
const session = authClient.useSession;

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
};

const emailLogin = (payload: FormSubmitEvent<LoginFormData>) => {
  submitting.value = true;
  error.value = null;

  authClient.signIn.email(
    {
      email: payload.data.email,
      password: payload.data.password,
      rememberMe: payload.data.remember,
    },
    {
      onSuccess: async () => {
        await loadCurrentUser();
        submitting.value = false;
        const next = useRoute().query.next;
        navigateTo(next ? `${next as string}` : "/");
      },
      onError: (ctx) => {
        error.value = translateAuthError(ctx.error.code);
        submitting.value = false;
      },
    },
  );
};

const githubLogin = async () => {
  submitting.value = true;
  error.value = null;

  const next = useRoute().query.next;

  await authClient.signIn.social({
    provider: "github",
    callbackURL: next ? `${next as string}` : "/",
  });
};

const googleLogin = async () => {
  submitting.value = true;
  error.value = null;

  const next = useRoute().query.next;

  await authClient.signIn.social({
    provider: "google",
    callbackURL: next ? `${next as string}` : "/",
  });
};

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
            <LazyUAlert
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
