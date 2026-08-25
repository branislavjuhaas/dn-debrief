<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

definePageMeta({
  middleware: ["anonymous"],
});

useSeoMeta({
  title: "Obnovenie hesla",
  description:
    "Obnovte si heslo na platforme DebRIEF a získajte prístup k svojmu účtu.",
});

const route = useRoute();

const authClient = useAuthClient();

const error = ref<string | null>(null);
const submitting = ref<boolean>(false);
const success = ref<boolean>(false);

const resetSchema = z.object({
  email: z.email("Neplatný email"),
});

type ResetFormData = z.output<typeof resetSchema>;

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Zadajte email",
    required: true,
    defaultValue: route.query.email as string | undefined,
  },
];

const resetPassword = async (payload: FormSubmitEvent<ResetFormData>) => {
  error.value = null;
  submitting.value = true;

  const { data, error: resetError } = await authClient.requestPasswordReset({
    email: payload.data.email,
  });

  if (resetError || !data) {
    error.value = translateAuthError(resetError?.code || "UNKNOWN_ERROR");
    submitting.value = false;
    return;
  }

  success.value = true;
  submitting.value = false;
};
</script>

<template>
  <UPage>
    <UPageHeader title="Obnovenie hesla na platforme DebRIEF" />
    <UPageBody>
      <FormBase title="Už len krok">
        <template #description>
          Zadajte svoj email pre získanie odkazu na obnovenie hesla.
        </template>
        <UAuthForm
          :schema="resetSchema"
          :fields="fields"
          separator="alebo"
          :ui="{
            providers: 'flex flex-col lg:flex-row space-y-0 gap-2',
          }"
          :loading="submitting"
          :submit="{
            disabled: success,
          }"
          :disabled="success"
          @submit="resetPassword">
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
              title="Ak daný email patrí k používateľovi/-ke platformy DebRIEF, poslali sme naň odkaz na obnovenie hesla." />
          </template>
        </UAuthForm>
      </FormBase>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
