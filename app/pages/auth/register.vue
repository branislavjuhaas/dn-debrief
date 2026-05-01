<script setup lang="ts">
import * as z from "zod";
import type { StepperItem } from "@nuxt/ui";
import { useStepper } from "@vueuse/core";
import { CalendarDate, parseDate } from "@internationalized/date";

const items = ref<StepperItem[]>([
  {
    title: "Tvorba účtu",
    description: "Prvé prihlásenie",
    icon: "i-ph-key-bold",
  },
  {
    title: "Zber údajov",
    description: "Úprava identity",
    icon: "i-ph-fingerprint-simple-bold",
  },
  {
    title: "Dokončenie účtu",
    description: "Ďalšie kroky po registrácii",
    icon: "i-ph-confetti-bold",
  },
]);

const { index, current, isCurrent, goTo, goToNext } = useStepper({
  "account-info": {
    title: "Vitajte na platforme",
  },
  "profile-completion": {
    title: "Ďakujeme za základné údaje",
    description: "Pre dokončenie účtu, vyplňte, prosím, osobné informácie",
  },
  "email-verification": {
    title: "Čakáme na overenie",
    description:
      "Na vami zadaný email sme poslali link na overenie účtu. Pre pokračovanie v registrácii, kliknite, prosím, na odkaz v maily.",
    icon: "i-ph-mailbox",
  },
  "next-steps": {
    title: "Už sme skoro hotoví",
    description:
      "Váš účet bol úspešne vytvorený. Pre získanie prístupu ku všetkým podujatiam a funkciám sa, prosím, registrujte do SDA.",
    icon: "i-ph-confetti",
  },
});

if (useRoute().query.verified) {
  goTo("profile-completion");
}

const userStore = useUserStore();

const accountSchema = z
  .object({
    email: z.email("Neplatný email"),
    password: z
      .string("Neplatné heslo")
      .min(8, "Heslo musí mať aspoň 8 znakov"),
    confirmPassword: z.string("Nesprávne potvrdené heslo"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Heslá sa nezhodujú",
    path: ["confirmPassword"], // error will appear on this field
  });

const accountState = reactive({
  email: "",
  password: "",
  confirmPassword: "",
});

const profileSchema = z.object({
  firstName: z.string("Meno je povinný údaj").nonempty("Meno je povinný údaj"),
  lastName: z
    .string("Priezvisko je povinný údaj")
    .nonempty("Priezvisko je povinný údaj"),
  birthDate: z
    .any()
    .refine(
      (value) => value instanceof CalendarDate,
      "Dátum narodenia je povinný údaj",
    ),
  street: z
    .string("Ulica trvalého pobytu je povinný údaj")
    .nonempty("Ulica trvalého pobytu je povinný údaj"),
  postalCode: z
    .string("PSČ trvalého pobytu je povinný údaj")
    .nonempty("PSČ trvalého pobytu je povinný údaj")
    .regex(/^\d{5}$/, "PSČ musí byť vo formáte 00000"),
  town: z
    .string("Obec trvalého pobytu je povinný údaj")
    .nonempty("Obec trvalého pobytu je povinný údaj"),
  phone: z.e164("Neplatné telefónne číslo"),
});

const profileState = reactive({
  firstName: userStore.user?.name || "",
  lastName: userStore.user?.surname || "",
  birthDate: userStore.user?.birthDate
    ? parseDate(userStore.user.birthDate) as unknown
    : null,
  phone: userStore.user?.phone || "",
  street: userStore.user?.street || "",
  postalCode: userStore.user?.postalCode || "",
  town: userStore.user?.town || "",
});

const authClient = useAuthClient();

const processingAccount = ref<boolean>(false);
const error = ref<string | null>(null);

const processAccount = () => {
  processingAccount.value = true;

  const loggedIn = !!userStore.user;

  const accountResult = accountSchema.safeParse(accountState);
  if (accountResult.error && !loggedIn) {
    error.value = "Neplatné údaje pre vytvorenie účtu";
    return;
  }

  const profileResult = profileSchema.safeParse(profileState);
  if (profileResult.error) {
    error.value = "Neplatné údaje pre dokončenie profilu";
    return;
  }

  if (loggedIn) {
    authClient.updateUser(
      {
        name: profileState.firstName,
        surname: profileState.lastName,
        birthDate: profileState.birthDate?.toString(),
        phone: profileState.phone,
        street: profileState.street,
        postalCode: profileState.postalCode,
        town: profileState.town,
      },
      {
        onSuccess: async () => {
          const { user } = await $fetch("/api/users/me");

          if (!user) {
            error.value = translateAuthError("UNKNOWN_ERROR");
            return;
          }

          await userStore.$patch({
            user,
          });

          processingAccount.value = false;
          goTo("next-steps");
        },
        onError: (err) => {
          error.value = translateAuthError(err);
          processingAccount.value = false;
        },
      },
    );
    return;
  }

  authClient.signUp.email(
    {
      email: accountState.email,
      password: accountState.password,
      name: profileState.firstName,
      surname: profileState.lastName,
      birthDate: profileState.birthDate?.toString(),
      phone: profileState.phone,
      street: profileState.street,
      postalCode: profileState.postalCode,
      town: profileState.town,
    },
    {
      onSuccess: () => {
        processingAccount.value = false;
        goTo("email-verification");
      },
      onError: (err) => {
        error.value = translateAuthError(err);
        processingAccount.value = false;
      },
    },
  );
};
</script>

<template>
  <UPage>
    <UPageHeader title="Registrácia na platformu DebRIEF" />
    <UPageBody>
      <FormBase
        :title="current.title"
        :description="current.description"
        :icon="current.icon">
        <template v-if="isCurrent('account-info')" #description>
          Máte už účet?
          <ULink to="/auth" class="text-secondary">Prihláste sa.</ULink>
        </template>

        <USeparator
          v-if="isCurrent('account-info') || isCurrent('profile-completion')" />

        <UForm
          v-if="isCurrent('account-info')"
          :schema="accountSchema"
          :state="accountState"
          class="space-y-5"
          @submit="goToNext()">
          <UFormField label="Email" name="email" required>
            <UInput
              v-model="accountState.email"
              type="email"
              placeholder="Zadejte email" />
          </UFormField>

          <UFormField label="Heslo" name="password" required>
            <UInput
              v-model="accountState.password"
              type="password"
              placeholder="Zadejte heslo" />
          </UFormField>

          <UFormField label="Potvrďte heslo" name="confirmPassword" required>
            <UInput
              v-model="accountState.confirmPassword"
              type="password"
              placeholder="Zadejte heslo znova" />
          </UFormField>

          <UButton type="submit" block> Pokračovat </UButton>
        </UForm>

        <UForm
          v-if="isCurrent('profile-completion')"
          :schema="profileSchema"
          :state="profileState"
          class="space-y-5"
          @submit="processAccount()">
          <UFormField label="Meno" name="firstName" required>
            <UInput
              v-model="profileState.firstName"
              placeholder="Zadejte svoje meno" />
          </UFormField>

          <UFormField label="Priezvisko" name="lastName" required>
            <UInput
              v-model="profileState.lastName"
              placeholder="Zadejte svoje priezvisko" />
          </UFormField>

          <UFormField label="Dátum narodenia" name="birthDate" required>
            <UInputDate v-model="profileState.birthDate" class="w-full" />
          </UFormField>

          <UFormField
            label="Telefónne číslo"
            name="phone"
            description="v medzinárodnom formáte s predvoľbou (+421...) a bez medzier"
            required>
            <UInput
              v-model="profileState.phone"
              placeholder="Zadejte telefonné číslo" />
          </UFormField>

          <USeparator label="Adresa trvalého pobytu" />

          <UFormField label="Ulica a číslo" name="street" required>
            <UInput
              v-model="profileState.street"
              placeholder="Zadejte ulicu trvalého pobytu" />
          </UFormField>

          <div class="flex space-x-4">
            <UFormField label="PSČ" name="postalCode" required class="flex-1">
              <UInput
                v-model="profileState.postalCode"
                placeholder="Zadejte PSČ trvalého pobytu" />
            </UFormField>

            <UFormField label="Obec" name="town" required class="flex-1">
              <UInput
                v-model="profileState.town"
                placeholder="Zadejte obec trvalého pobytu" />
            </UFormField>
          </div>

          <LazyUAlert
            v-if="error"
            color="error"
            icon="i-ph-warning-octagon"
            :title="error" />

          <UButton type="submit" block :loading="processingAccount">
            Pokračovat
          </UButton>
        </UForm>

        <UButton v-if="isCurrent('next-steps')" to="/profile/join" block
          >Registrovať sa do SDA</UButton
        >

        <USeparator />

        <template #footer>
          <UStepper v-model="index" :items="items" :disabled="true" />
        </template>
      </FormBase>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
