<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

useSeoMeta({
  title: "Obnovenie hesla",
  description:
    "Vytvorte si nové heslo na platforme DebRIEF a získajte prístup k svojmu účtu.",
});

const authClient = useAuthClient();
const route = useRoute();

const error = ref<string | null>(null);
const submitting = ref<boolean>(false);
const success = ref<boolean>(false);

const resetSchema = z
  .object({
    password: z.string("Zadajte heslo").min(8, "Heslo musí mať aspoň 8 znakov"),
    passwordConfirmation: z
      .string("Zadajte potvrdenie hesla")
      .min(8, "Potvrdenie hesla musí mať aspoň 8 znakov"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Heslá sa nezhodujú",
    path: ["passwordConfirmation"],
  });

type ResetFormData = z.output<typeof resetSchema>;

const fields: AuthFormField[] = [
  {
    name: "password",
    label: "Heslo",
    type: "password",
    placeholder: "Zadajte heslo ",
    required: true,
  },
  {
    name: "passwordConfirmation",
    label: "Potvrdenie hesla",
    type: "password",
    placeholder: "Zadajte potvrdenie hesla ",
    required: true,
  },
];

const createPassword = async (payload: FormSubmitEvent<ResetFormData>) => {
  error.value = null;
  submitting.value = true;

  if (!route.query.token) {
    error.value = "Chýba token na obnovenie hesla";
    submitting.value = false;
    return;
  }

  if (payload.data.password !== payload.data.passwordConfirmation) {
    error.value = "Heslá sa nezhodujú";
    submitting.value = false;
    return;
  }

  const { data, error: createError } = await authClient.resetPassword({
    newPassword: payload.data.password,
    token: route.query.token as string,
  });

  if (createError || !data) {
    error.value = translateAuthError(createError?.code || "UNKNOWN_ERROR");
    submitting.value = false;
    return;
  }

  success.value = true;
  setTimeout(() => {
    navigateTo("/auth");
  }, 3000);
};
</script>

<template>
  <UPage>
    <UPageHeader title="Obnovenie hesla na platforme DebRIEF" />
    <UPageBody>
      <FormBase title="Nový začiatok">
        <template #description>
          Zadajte nové heslo pre svoj účet na platforme DebRIEF.
        </template>
        <UAuthForm
          :schema="resetSchema"
          :fields="fields"
          separator="alebo"
          :ui="{
            providers: 'flex flex-col lg:flex-row space-y-0 gap-2',
          }"
          :loading="submitting"
          @submit="createPassword">
          <template #validation>
            <LazyUAlert
              v-if="error"
              color="error"
              icon="i-ph-warning-octagon"
              :title="error" />
            <LazyUAlert
              v-if="success"
              color="success"
              icon="i-ph-check-circle"
              title="Heslo bolo úspešne obnovené. Presmerúvame vás na prihlásenie." />
          </template>
        </UAuthForm>
      </FormBase>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
