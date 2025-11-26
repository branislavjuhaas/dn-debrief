<script setup lang="ts">
import AppDialog from "~/components/dialog/AppDialog.vue";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import type { StepperItem } from "@nuxt/ui";
import * as z from "zod";
import { createAuthClient } from "better-auth/vue";

/** Gate the route to unauthenticated visitors. */
definePageMeta({
  halfguest: true,
});

/** Sets SEO meta-tags so the register page stays share-friendly */
useSeoMeta({
  title: "Registrácia",
});

type Step =
  | "account"
  | "collection"
  | "supervisors"
  | "verification"
  | "complete";

/** Formatter used to preview the selected birthdate in Slovak locale */
const df = new DateFormatter("sk-SK", {
  dateStyle: "medium",
});

const route = useRoute();
const authClient = createAuthClient();
const userStore = useUserStore();

/** Three-step wizard definition rendered by the stepper */
const items = [
  {
    title: "Tvorba účtu",
    description: "Prvé prihlásenie",
    icon: "ph:key-bold",
  },
  {
    title: "Zber údajov",
    description: "Overenie identity",
    icon: "ph:fingerprint-simple-bold",
  },
  {
    title: "Registrácia do SDA",
    description: "Kompletizácia prístupu",
    icon: "ph:confetti",
  },
] satisfies StepperItem[];

/** Tracks wizard progress based on query params and form completion */
const currentStep = ref<Step>(
  route.query.collection === "true"
    ? "collection"
    : route.query.verify
      ? "complete"
      : "account",
);

/** Supports surfacing backend validation issues to the user */
const regError = ref<string>("");

/** Validates credentials and consent in the first step */
const accountSchema = z
  .object({
    email: z.email("Neplatný email"),
    password: z
      .string("Heslo je povinné")
      .min(8, "Heslo musí mať aspoň 8 znakov"),
    confirmPassword: z.string("Potvrdenie hesla je povinné"),
    agreeToTerms: z.boolean().refine((v) => v, {
      message: "Pred pokračovaním musíte súhlasiť s podmienkami",
    }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Heslá sa nezhodujú",
        path: ["confirmPassword"],
      });
    }
  });

/** Validates personal information captured during data collection */
const userSchema = z.object({
  name: z.string("Meno je povinné").min(2, "Meno musí mať aspoň 2 znaky"),
  surname: z
    .string("Priezvisko je povinné")
    .min(2, "Priezvisko musí mať aspoň 2 znaky"),
  birthdate: z
    .any()
    .refine((v) => v != null, { message: "Dátum narodenia je povinný" }),
  address: z
    .string("Adresa je povinná")
    .regex(/^.+,\s*\d{5}\s+.+$/, "Neplatný formát adresy"),
});

/** Validates information about supervisors during data collection */
const supervisorSchema = z.object({
  name: z.string("Meno je povinné").min(2, "Meno musí mať aspoň 2 znaky"),
  email: z.email("Neplatný email"),
});

type AccountSchema = z.output<typeof accountSchema>;
type UserSchema = z.output<typeof userSchema>;
type SupervisorSchema = z.output<typeof supervisorSchema>;

/** Holds transient credentials before the API call */
const accountState = reactive<Partial<AccountSchema>>({
  email: undefined,
  password: undefined,
  confirmPassword: undefined,
  agreeToTerms: undefined,
});

/** Holds personal info values for the collection step */
const userState = reactive<Partial<UserSchema>>({
  name: userStore?.user?.name.split(" ")[0] || undefined,
  surname: userStore?.user?.name.split(" ")[1] || undefined,
  birthdate: undefined,
  address: undefined,
});

/** Holds info about supervisor */
const supervisorState = reactive<Partial<SupervisorSchema>>({
  name: undefined,
  email: undefined,
});

/**
 * Creates supervisor records for underage users.
 * @param supervisor Supervisor details to create
 */
const createSupervisors = async (supervisor: Partial<SupervisorSchema>) => {
  if (!supervisor.name || !supervisor.email) {
    return;
  }

  await useFetch("/api/users/me/supervisors", {
    method: "POST",
    body: supervisor,
  });
};

/**
 * Submits the personal details form, updating the flow depending on query flags.
 * - In collection mode, only user profile data is patched.
 * - Otherwise, both account and identity data are validated before signup.
 */
const submitRegistration = async () => {
  if (route.query.collection === "true") {
    try {
      await authClient.updateUser({
        name: `${userState.name} ${userState.surname}`,
        birthdate: userState.birthdate.toString(),
        address: userState.address,
      } as any);

      await createSupervisors(supervisorState);

      currentStep.value = "complete";
    } catch (err: any) {
      regError.value = useAuthError(err.code);
    }
    return;
  }

  if (
    Object.values(accountState).some(
      (v) => v == undefined || null || "" || false,
    )
  ) {
    regError.value = "Neplatné údaje používateľského účtu";
    return;
  }

  console.log("submitting registration");

  const { data, error } = await authClient.signUp.email({
    email: accountState.email,
    password: accountState.password,
    name: `${userState.name} ${userState.surname}`,
    birthdate: userState.birthdate.toString(),
    address: userState.address,
    supervisor:
      useAge(userState.birthdate.toString()) < 18
        ? {
            name: supervisorState.name,
            email: supervisorState.email,
          }
        : undefined,
  } as any);

  if (error || !data) {
    console.log(error, data);
    regError.value = useAuthError((error as any).code || "UNKNOWN_ERROR");
    return;
  }

  if ((data as any).emailVerified) {
    await userStore.set();
    currentStep.value = "complete";

    return;
  }

  currentStep.value = "verification";
};

/** Shows a success toast when the verify flag confirms email completion */
onMounted(async () => {
  if (route.query.verify !== "true") {
    console.log("no verification needed");
    return;
  }

  const toast = useToast();

  toast.add({
    title: "Overenie identity úspešné",
    description: "Váš email bol úspešne overený. Môžete sa prihlásiť.",
    icon: "ph:check-circle-fill",
    color: "success",
    actions: [
      {
        label: "Prihlásiť sa",
        color: "primary",
        block: true,
        onClick: () => {
          navigateTo("/auth");
        },
      },
    ],
  });
});

const currentStepperStep = computed(() => {
  switch (currentStep.value) {
    case "account":
      return 0;
    case "collection":
    case "supervisors":
      return 1;
    case "verification":
    case "complete":
      return 2;
    default:
      return 0;
  }
});
</script>

<template>
  <UPageSection>
    <ProseH1>Registrácia na platformu DN Cascade</ProseH1>
    <AppDialog>
      <!-- EMAIL VERIFICATION NOTICE -->
      <DialogHeader
        v-if="currentStep === 'verification'"
        title="Čakáme na overenie"
        icon="ph:mailbox">
        Na vami zadaný email sme poslali overenie účtu. Pre pokračovanie v
        registrácii, kliknite, prosím, na odkaz v maily.
      </DialogHeader>
      <!-- ACCOUNT CREATION -->
      <template v-else-if="currentStep === 'account'">
        <DialogHeader title="Vitajte na platforme">
          Máte už účet?
          <NuxtLink to="/auth" class="text-secondary font-medium">
            Prihláste sa!
          </NuxtLink>
        </DialogHeader>
        <USeparator />
        <UForm
          :schema="accountSchema"
          :state="accountState"
          class="space-y-4 w-full"
          @submit="currentStep = 'collection'">
          <UFormField label="Email" name="email" required>
            <UInput
              v-model="accountState.email"
              placeholder="Zadajte email"
              class="w-full" />
          </UFormField>

          <UFormField label="Heslo" name="password" required>
            <UInput
              v-model="accountState.password"
              type="password"
              placeholder="Zadajte heslo"
              class="w-full" />
          </UFormField>

          <UFormField label="Potvrďte heslo" name="confirmPassword" required>
            <UInput
              v-model="accountState.confirmPassword"
              type="password"
              placeholder="Zadajte opäť heslo"
              class="w-full" />
          </UFormField>
          <UCheckbox v-model="accountState.agreeToTerms" required>
            <template #label>
              Súhlasím s
              <NuxtLink to="/privacy-policy" class="underline">
                vyhlásením GDPR
              </NuxtLink>
              a
              <NuxtLink to="/terms-of-service" class="underline">
                podmienkami používania.
              </NuxtLink>
            </template>
          </UCheckbox>

          <UButton type="submit" block>Pokračovať</UButton>
        </UForm>
      </template>
      <!-- PERSONAL INFORMATION COLLECTION -->
      <template v-else-if="currentStep === 'collection'">
        <DialogHeader
          title="Už sme skoro hotoví"
          description="Pre jeho dokončenie vyplňte, prosím, osobné údaje" />
        <USeparator />
        <UForm
          :schema="userSchema"
          :state="userState"
          class="space-y-4 w-full"
          @submit="
            useAge(userState.birthdate.toString()) >= 18
              ? submitRegistration()
              : (currentStep = 'supervisors')
          ">
          <UFormField label="Meno" name="name" required>
            <UInput
              v-model="userState.name"
              placeholder="Zadajte meno"
              class="w-full" />
          </UFormField>
          <UFormField label="Priezvisko" name="surname" required>
            <UInput
              v-model="userState.surname"
              placeholder="Zadajte priezvisko"
              class="w-full" />
          </UFormField>

          <UFormField label="Dátum narodenia" name="birthdate" required>
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="ph:calendar-dots"
                class="w-full">
                {{
                  userState.birthdate
                    ? df.format(userState.birthdate.toDate(getLocalTimeZone()))
                    : "Vyberte dátum"
                }}
              </UButton>

              <template #content>
                <UCalendar v-model="userState.birthdate" class="p-2" />
              </template>
            </UPopover>
          </UFormField>

          <UFormField label="Adresa trvalého pobytu" name="address" required>
            <UInput
              v-model="userState.address"
              placeholder="Zadajte adresu (mesto NO, PSČ Obec)"
              class="w-full" />
          </UFormField>

          <UAlert
            v-if="regError != ''"
            color="error"
            icon="ph:warning-octagon-fill"
            :title="regError" />

          <UButton type="submit" block>Pokračovať</UButton>
        </UForm>
      </template>
      <!-- SUPERVISOR INFORMATION COLLECTION -->
      <template v-else-if="currentStep === 'supervisors'">
        <DialogHeader
          title="Ešte pár informácií"
          description="Uveďte údaje o vašom zákonnom zástupcovi" />
        <USeparator />
        <UForm
          :schema="supervisorSchema"
          :state="supervisorState"
          class="space-y-4 w-full"
          @submit="submitRegistration">
          <UFormField label="Meno zákonného zástupcu" name="name" required>
            <UInput
              v-model="supervisorState.name"
              placeholder="Zadajte meno zákonného zástupcu"
              class="w-full" />
          </UFormField>
          <UFormField label="Email zákonného zástupcu" name="email" required>
            <UInput
              v-model="supervisorState.email"
              placeholder="Zadajte email zákonného zástupcu"
              class="w-full" />
          </UFormField>

          <UAlert
            v-if="regError != ''"
            color="error"
            icon="ph:warning-octagon-fill"
            :title="regError" />

          <UButton type="submit" block>Pokračovať</UButton>
        </UForm>
      </template>
      <!-- COMPLETION OF REGISTRATION -->
      <template v-else>
        <DialogHeader title="Už sme skoro hotoví" icon="ph:fingerprint-simple">
          Váš účet bol úspešne vytvorený. Pre získanie prístupu ku všetkým
          podujatiam sa, prosím, registrujte do SDA.
        </DialogHeader>

        <UAlert
          v-if="route.query.verify === 'false'"
          color="error"
          icon="ph:warning-octagon-fill"
          title="Váš účet sa nepodarilo overiť. Skúste to, prosím, znova." />
        <UButton v-else block>Registrovať sa do SDA</UButton>
      </template>

      <USeparator />
      <UStepper
        :items="items"
        class="w-full"
        disabled
        v-model="currentStepperStep" />
    </AppDialog>
  </UPageSection>
</template>

<style scoped></style>
