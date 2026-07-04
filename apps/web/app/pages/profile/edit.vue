<script setup lang="ts">
import { CalendarDate, parseDate } from "@internationalized/date";
import type { ButtonProps, FormSubmitEvent } from "@nuxt/ui";
import { differenceInYears } from "date-fns";
import { motion } from "motion-v";
import * as z from "zod";

// PAGE SETUP
definePageMeta({
  middleware: ["auth"],
});

useSeoMeta({
  title: "Upravit profil",
  description: "Úprava vlastného profilu na platforme DebRIEF.",
});

const userStore = useUserStore();
const authClient = useAuthClient();

// SHARED TEMPLATE REFS
const profileForm = useTemplateRef("profileForm");
const passwordForm = useTemplateRef("passwordForm");
const currentPasswordInput = useTemplateRef("currentPasswordInput");

// PROFILE FEATURE
const updatingProfile = ref(false);

const profileState = reactive({
  firstName: userStore.user?.name ?? "",
  lastName: userStore.user?.surname ?? "",
  birthDate: userStore.user?.birthDate
    ? parseDate(userStore.user.birthDate)
    : null,
  phone: userStore.user?.phone ?? "",
  street: userStore.user?.street ?? "",
  postalCode: userStore.user?.postalCode ?? "",
  town: userStore.user?.town ?? "",
  legalGuardian: userStore.user?.legalGuardian ?? undefined,
});

const age = computed(() => {
  return Math.abs(
    differenceInYears(
      profileState.birthDate?.toString() || new Date(),
      new Date(),
    ),
  );
});

const profileSchema = z.object({
  firstName: z.string().nonempty("Krstné meno je povinný údaj"),
  lastName: z.string().nonempty("Priezvisko je povinný údaj"),
  birthDate: z
    .any()
    .refine(
      (value) => value instanceof CalendarDate,
      "Dátum narodenia je povinný údaj",
    ),
  phone: z.e164("Neplatné telefónne číslo"),
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
            value !== userStore.user?.email
          );
        }, "Email zákonného/-ej zástupcu/-kne musí byť platný a rôzny od emailu používateľa"),
    })
    .optional(),
});

type ProfileSchema = z.output<typeof profileSchema>;

const saveProfile = async () => {
  updatingProfile.value = true;

  authClient.updateUser(
    {
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
      onSuccess: async () => {
        const { user } = await $fetch("/api/users/me");

        if (!user) {
          return;
        }

        userStore.$patch({ user });

        navigateTo("/profile");
      },
      onError: (err: any) => {},
    },
  );
};

// PASSWORD FEATURE
const updatingPassword = ref(false);

const changingPassword = ref(useRoute().hash === "#change-password");

const show = ref({
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
});

const passwordSchema = z
  .object({
    currentPassword: z.string().nonempty("Súčasné heslo je povinné"),
    newPassword: z.string().min(8, "Heslo musí mať aspoň 8 znakov"),
    confirmPassword: z.string().nonempty("Potvrdenie hesla je povinné"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Heslá sa nezhodujú",
    path: ["confirmPassword"],
  });

type PasswordState = z.output<typeof passwordSchema>;

const passwordState = reactive<PasswordState>({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const submitPasswordChange = async (event: FormSubmitEvent<PasswordState>) => {
  await authClient.changePassword({
    newPassword: event.data.newPassword,
    currentPassword: event.data.currentPassword,
    revokeOtherSessions: true,
  });

  navigateTo("/profile");
};

// LIFECYCLE
onMounted(() => {
  if (changingPassword.value) {
    currentPasswordInput.value?.inputRef?.focus();
  }
});
</script>

<template>
  <UPage>
    <UPageBody class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16">
      <div class="space-y-6">
        <UPageHeader
          title="Upraviť profil"
          class="border-b border-default pb-8">
          <template #links>
            <UButton
              label="Uložiť zmeny"
              icon="i-ph-checks"
              color="primary"
              variant="solid"
              :loading="updatingProfile"
              @click="profileForm?.submit()" />
          </template>
        </UPageHeader>

        <UForm
          ref="profileForm"
          :disabled="updatingProfile"
          :schema="profileSchema"
          :state="profileState"
          @submit="saveProfile"
          class="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <UFormField label="Telefónne číslo" name="phone" required>
            <UInput
              v-model="profileState.phone"
              placeholder="Zadejte telefonné číslo (+421...)" />
          </UFormField>

          <UFormField label="Ulica a číslo" name="street" required>
            <UInput
              v-model="profileState.street"
              placeholder="Zadejte ulicu trvalého pobytu" />
          </UFormField>

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
        </UForm>

        <USeparator />

        <UForm
          v-if="
            changingPassword &&
            userStore.user!.accounts?.some((a) => a.providerId === 'credential')
          "
          ref="passwordForm"
          v-motion
          :initial="{ opacity: 0, height: 0 }"
          :animate="{ opacity: 1, height: 'auto' }"
          :schema="passwordSchema"
          :state="passwordState"
          :disabled="updatingPassword"
          @submit="submitPasswordChange"
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <UFormField label="Súčasné heslo" name="currentPassword" required>
            <UInput
              v-model="passwordState.currentPassword"
              ref="currentPasswordInput"
              :type="show.currentPassword ? 'text' : 'password'"
              placeholder="Zadajte súčasné heslo">
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="
                    show.currentPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                  "
                  :aria-label="
                    show.currentPassword ? 'Hide password' : 'Show password'
                  "
                  :aria-pressed="show.currentPassword"
                  aria-controls="password"
                  @click="
                    void (show.currentPassword = !show.currentPassword)
                  " />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Nové heslo" name="newPassword" required>
            <UInput
              v-model="passwordState.newPassword"
              :type="show.newPassword ? 'text' : 'password'"
              placeholder="Zadajte nové heslo">
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="show.newPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="
                    show.newPassword ? 'Hide password' : 'Show password'
                  "
                  :aria-pressed="show.newPassword"
                  aria-controls="password"
                  @click="void (show.newPassword = !show.newPassword)" />
              </template>
            </UInput>
          </UFormField>

          <UFormField
            label="Potvrďte nové heslo"
            name="confirmPassword"
            required>
            <UInput
              v-model="passwordState.confirmPassword"
              :type="show.confirmPassword ? 'text' : 'password'"
              placeholder="Potvrďte nové heslo">
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="
                    show.confirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                  "
                  :aria-label="
                    show.confirmPassword ? 'Hide password' : 'Show password'
                  "
                  :aria-pressed="show.confirmPassword"
                  aria-controls="password"
                  @click="
                    void (show.confirmPassword = !show.confirmPassword)
                  " />
              </template>
            </UInput>
          </UFormField>
        </UForm>

        <div class="flex flex-col md:flex-row gap-4">
          <UButton
            v-if="
              userStore.user!.accounts?.some(
                (a) => a.providerId === 'credential',
              )
            "
            :label="changingPassword ? 'Uložiť zmenu hesla' : 'Zmeniť heslo'"
            :loading="updatingPassword"
            @click="
              if (changingPassword) {
                passwordForm?.submit();
              } else {
                changingPassword = true;
              }
            "
            icon="i-ph-password"
            :color="changingPassword ? 'primary' : 'secondary'"
            block
            class="w-full" />
          <UButton
            label="Doplnit údaje administrátorom"
            icon="i-ph-shield-check"
            color="neutral"
            href="mailto:debrief@sda.sk?subject=Žiadosť o doplnenie údajov"
            block
            class="w-full" />
          <UButton
            label="Požiadať o odstránenie účtu"
            icon="i-ph-file-x"
            color="error"
            block
            disabled
            class="w-full" />
        </div>
      </div>

      <span
        class="relative mx-auto inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle bg-elevated size-40 text-4xl"
        aria-hidden="true">
        <NuxtImg
          v-if="userStore.user?.image"
          :src="userStore.user.image"
          alt=""
          width="160"
          height="160"
          class="h-full w-full rounded-[inherit] object-cover" />

        <span v-else class="font-medium truncate">
          {{ userStore.fullName }}
        </span>

        <UButton
          label="Zmeniť"
          size="xs"
          color="secondary"
          icon="i-ph-pencil-simple-line"
          disabled
          class="absolute bottom-4 right-0 text-white font-medium ring-2 ring-bg overflow-hidden hover:bg-secondary-400 active:bg-secondary-400 dark:hover:bg-secondary-500 dark:active:bg-secondary-500" />
      </span>
    </UPageBody>
  </UPage>
</template>
