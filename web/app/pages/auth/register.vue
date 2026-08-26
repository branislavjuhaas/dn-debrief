<script setup lang="ts">
import * as z from "zod";
import type { StepperItem } from "@nuxt/ui";
import { useStepper } from "@vueuse/core";
import { CalendarDate, parseDate } from "@internationalized/date";
import { differenceInYears } from "date-fns";

const route = useRoute();
const completionOnly = ref<boolean>(route.query.completion === "true");

useSeoMeta({
  title: completionOnly.value ? "Doplnenie údajov" : "Registrácia",
  description:
    "Vytvorte svoj účet na platforme DebRIEF a začněte využívať všetky jej funkcie.",
});

// STEPPER CONFIGURATION
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

const { current, isCurrent, goTo, goToNext } = useStepper({
  "account-info": {
    title: "Vitajte na platforme",
    description: undefined,
    icon: undefined,
    step: 0,
  },
  "profile-completion": {
    title: "Ďakujeme za základné údaje",
    description: "Pre dokončenie účtu, vyplňte, prosím, osobné informácie",
    icon: undefined,
    step: 1,
  },
  "email-verification": {
    title: "Čakáme na overenie",
    description:
      "Na vami zadaný email sme poslali link na overenie účtu. Pre pokračovanie v registrácii, kliknite, prosím, na odkaz v maily.",
    icon: "i-ph-mailbox",
    step: 1,
  },
  "email-verified": {
    title: route.query.error ? "Email nebol overený" : "Váš email bol overený!",
    description: route.query.error
      ? "Váš email sa nepodarilo overiť. Ak bude problém pretrvávať, prosím, kontaktujte podporu."
      : "Dakujeme za overenie vášho emailu. Pre získanie maximálnych možností platfotmy DebRIEF, prosím, pokračujte v registrácii.",
    icon: route.query.error ? "i-ph-warning" : "i-ph-checks",
    step: 1,
  },
  "next-steps": {
    title: "Už sme skoro hotoví",
    description:
      "Váš účet bol úspešne vytvorený. Pre získanie prístupu ku všetkým podujatiam a funkciám sa, prosím, registrujte do SDA.",
    icon: "i-ph-confetti",
    step: 2,
  },
  "return-home": {
    title: "Hotovo!",
    description:
      "Váš účet bol úspešne aktualizovaný. Pokračujte, prosím, na domovskú stránku.",
    icon: "i-ph-confetti",
    step: 2,
  },
});

// CLIENT SERVICES & STORES
const authClient = useAuthClient();

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const processingAccount = ref<boolean>(false);
const error = ref<string | null>(null);

// INITIAL ROUTING / MIDDLEWARE LOGIC
if (route.query.completion) {
  if (!userData?.value?.user) {
    navigateTo("/auth");
  }
  goTo("profile-completion");
} else if (route.query.verified) {
  goTo("email-verified");
} else if (route.query.next) {
  if (!userData?.value?.user) {
    navigateTo("/auth?next=/auth/register?next=true");
  }
  goTo("next-steps");
} else {
  if (userData?.value?.user) {
    navigateTo("/profile");
  }
}

// VALIDATION SCHEMAS & STATE

// --- Account Setup ---
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
    path: ["confirmPassword"],
  });

const accountState = reactive({
  email: "",
  password: "",
  confirmPassword: "",
});

// --- Profile Details ---
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
  legalGuardian: z
    .object({
      name: z
        .string("Meno zákonného/-ej zástupce/-kne je povinný údaj")
        .refine((value) => {
          if (age.value >= 18) return true;
          return value.length > 0;
        }, "Meno zákonného/-ej zástupcu/-kne nemôže byť prázdne"),
      email: z
        .string("Email zákonného/-ej zástupce/-kne je povinný údaj")
        .refine((value) => {
          if (age.value >= 18) return true;
          return (
            z.email().safeParse(value).success &&
            value !== userData?.value?.user?.email &&
            value !== accountState.email
          );
        }, "Email zákonného/-ej zástupcu/-kne musí byť platný a rôzny od emailu používateľa"),
    })
    .optional(),
});

const profileState = reactive<{
  firstName: string;
  lastName: string;
  birthDate: CalendarDate | null;
  phone: string;
  street: string;
  postalCode: string;
  town: string;
  legalGuardian: {
    name: string;
    email: string;
  };
}>({
  firstName: userData?.value?.user?.name || "",
  lastName: userData?.value?.user?.surname || "",
  birthDate: userData?.value?.user?.birthDate
    ? parseDate(userData?.value?.user?.birthDate)
    : null,
  phone: userData?.value?.user?.phone || "",
  street: userData?.value?.user?.street || "",
  postalCode: userData?.value?.user?.postalCode || "",
  town: userData?.value?.user?.town || "",
  legalGuardian: {
    name: userData?.value?.user?.legalGuardian?.name || "",
    email: userData?.value?.user?.legalGuardian?.email || "",
  },
});

// COMPUTED PROPERTIES
const age = computed(() => {
  return Math.abs(
    differenceInYears(
      profileState.birthDate?.toString() || new Date(),
      new Date(),
    ),
  );
});

// METHODS / BUSINESS LOGIC
const processAccount = () => {
  processingAccount.value = true;
  const loggedIn = !!userData?.value?.user;

  const accountResult = accountSchema.safeParse(accountState);
  if (accountResult.error && !loggedIn) {
    error.value = "Neplatné údaje pre vytvorenie účtu";
    processingAccount.value = false;
    return;
  }

  const profileResult = profileSchema.safeParse(profileState);
  if (profileResult.error) {
    error.value = "Neplatné údaje pre dokončenie profilu";
    processingAccount.value = false;
    return;
  }

  if (loggedIn) {
    authClient.updateUser(
      {
        name: profileState.firstName,
        surname: profileState.lastName,
        birthDate: profileState.birthDate?.toString() || undefined,
        phone: profileState.phone,
        street: profileState.street,
        postalCode: profileState.postalCode,
        town: profileState.town,
        ...(age.value < 18
          ? { legalGuardian: profileState.legalGuardian }
          : {}),
      } as any,
      {
        onSuccess: async () => {
          const { user } = await $fetch("/api/users/me");

          if (!user) {
            error.value = translateAuthError("UNKNOWN_ERROR");
            processingAccount.value = false;
            return;
          }

          await refreshNuxtData("users-me");
          processingAccount.value = false;

          if (
            userData?.value?.user?.clubMemberships?.some(
              (membership) => membership.season === new Date().getFullYear(),
            )
          ) {
            goTo("return-home");
            return;
          }
          goTo("next-steps");
        },
        onError: (err: any) => {
          error.value = translateAuthError(err.code || "UNKNOWN_ERROR");
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
      birthDate: profileState.birthDate?.toString() || undefined,
      phone: profileState.phone,
      street: profileState.street,
      postalCode: profileState.postalCode,
      town: profileState.town,
      ...(age.value < 18 ? { legalGuardian: profileState.legalGuardian } : {}),
    } as any,
    {
      onSuccess: () => {
        processingAccount.value = false;
        goTo("email-verification");
      },
      onError: (err: any) => {
        error.value = translateAuthError(err.code || "UNKNOWN_ERROR");
        processingAccount.value = false;
      },
    },
  );
};

const continueFromEmailVerified = () => {
  if (!userData?.value?.user) {
    goTo("next-steps");
    return;
  }

  navigateTo("/auth?next=/auth/register?next=true");
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="
        completionOnly
          ? 'Doplnenie osobných údajov'
          : 'Registrácia na platformu DebRIEF'
      " />

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
            <UInputDate
              v-model="profileState.birthDate as CalendarDate | null"
              class="w-full" />
          </UFormField>

          <UFormField
            label="Telefónne číslo"
            name="phone"
            description="v medzinárodnom formáte s predvoľbou (+421...) and bez medzier"
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

          <template v-if="age < 18">
            <USeparator label="Údaje zákonného/-ej zástupcu/-kyne" />

            <UFormField
              label="Meno a priezvisko"
              name="legalGuardian.name"
              required>
              <UInput
                v-model="profileState.legalGuardian.name"
                placeholder="Zadejte meno a priezvisko zákonného/-ej zástupcu/-kyne" />
            </UFormField>

            <UFormField label="E-mail" name="legalGuardian.email" required>
              <UInput
                v-model="profileState.legalGuardian.email"
                type="email"
                placeholder="Zadejte e-mail zákonného/-ej zástupcu/-kyne" />
            </UFormField>
          </template>

          <LazyUAlert
            v-if="error"
            color="error"
            icon="i-ph-warning-octagon"
            :title="error" />

          <UButton type="submit" block :loading="processingAccount">
            Pokračovat
          </UButton>
        </UForm>

        <UButton
          v-if="isCurrent('email-verified')"
          :disabled="!!route.query.error"
          block
          @click="continueFromEmailVerified">
          Pokračovať
        </UButton>

        <UButton v-else-if="isCurrent('next-steps')" to="/profile/join" block>
          Registrovať sa do SDA
        </UButton>

        <UButton v-else-if="isCurrent('return-home')" to="/" block>
          Návrat na domovskú stránku
        </UButton>

        <USeparator />

        <template #footer>
          <UStepper v-model="current.step" :items="items" :disabled="true" />
        </template>
      </FormBase>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
