<script setup lang="ts">
import type { Event, RegistrationRole } from "#shared/types/event";
import { isPlatformRegistration, isSectionVisible } from "#shared/utils/events";
import { CalendarDate, parseDate } from "@internationalized/date";

const route = useRoute();
const slug = route.params.slug as string;
const toast = useToast();

// Fetch event details
const { data: eventData, error: eventFetchError } = await useFetch<{
  event: Event;
}>(`/api/events/${slug}`, {
  key: `event-register-${slug}`,
});

if (eventFetchError.value || !eventData.value?.event) {
  throw createError({
    statusCode: 404,
    statusMessage: "Podujatie nenájdené",
    message: `Podujatie s identifikátorom "${slug}" nebolo nájdené`,
  });
}

const event = computed(() => eventData.value!.event);
const config = computed(() => {
  const c = event.value.registrationConfig;
  return isPlatformRegistration(c) ? c : null;
});

// Fetch current user session
const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});
const user = computed(() => userFetch.value?.user);
const isLoggedIn = computed(() => Boolean(user.value));

// Check if current user is already registered for this event
const { data: userRegistrationsData } = await useFetch(
  `/api/users/${user.value?.id}/registrations`,
  {
    key: `my-registrations-check-${slug}`,
  },
);

const alreadyRegistered = computed(() => {
  if (!user.value) return false;
  return (userRegistrationsData.value?.registrations ?? []).some(
    (r: any) => r.eventId === event.value.id,
  );
});

// Active roles & sections
const activeRoles = computed<RegistrationRole[]>(() =>
  (config.value?.roles ?? []).filter((r) => !r.deleted),
);

const isRoleDisabled = (role: RegistrationRole) =>
  !isLoggedIn.value && (role.cost ?? 0) > 0;

const activeSections = computed(() =>
  (config.value?.sections ?? []).filter((s) => !s.deleted),
);

// Form state
const selectedRoleUuid = ref<string>("");
const teamName = ref<string>("");

const guestDetails = ref({
  name: "",
  surname: "",
  email: "",
  phone: "",
  birthDate: "",
  street: "",
  postalCode: "",
  town: "",
});

const answers = ref<Record<string, any>>({});
const fieldErrors = ref<Record<string, string>>({});
const submitting = ref(false);

// Auto-select role if only 1 exists and is not disabled
watch(
  [activeRoles, isLoggedIn],
  ([roles]) => {
    if (
      roles.length === 1 &&
      !isRoleDisabled(roles[0]!) &&
      !selectedRoleUuid.value
    ) {
      selectedRoleUuid.value = roles[0]!.uuid;
    } else if (
      selectedRoleUuid.value &&
      roles.some((r) => r.uuid === selectedRoleUuid.value && isRoleDisabled(r))
    ) {
      selectedRoleUuid.value = "";
    }
  },
  { immediate: true },
);

// Selected role object
const selectedRole = computed(() =>
  activeRoles.value.find((r) => r.uuid === selectedRoleUuid.value),
);

// Check if team step is needed
const hasTeamStep = computed(() => Boolean(selectedRole.value?.hasTeamVariant));

// Check if guest step is needed
const hasGuestStep = computed(() => !isLoggedIn.value);

// Check if role step is needed
const hasRoleStep = computed(
  () =>
    activeRoles.value.length > 1 ||
    activeRoles.value.some((r) => isRoleDisabled(r)),
);

// Filter visible sections dynamically based on role and prior answers
const visibleDynamicSections = computed(() => {
  if (!config.value || !selectedRoleUuid.value) return [];

  // Determine starting section for the selected role
  let sectionsToEvaluate = activeSections.value;
  const startMapping = config.value.conditionalStartSections?.find(
    (c) => c.roleUuid === selectedRoleUuid.value,
  );
  if (startMapping) {
    const startIdx = sectionsToEvaluate.findIndex(
      (s) => s.uuid === startMapping.sectionUuid,
    );
    if (startIdx !== -1) {
      sectionsToEvaluate = sectionsToEvaluate.slice(startIdx);
    }
  }

  return sectionsToEvaluate.filter((section) =>
    isSectionVisible(section, selectedRoleUuid.value, answers.value),
  );
});

// Step definitions
type WizardStep =
  | {
      type: "role";
      title: string;
      description: string;
    }
  | {
      type: "team";
      title: string;
      description: string;
    }
  | {
      type: "guest";
      title: string;
      description: string;
    }
  | {
      type: "section";
      sectionUuid: string;
      title: string;
      description: string;
    };

const steps = computed<WizardStep[]>(() => {
  const result: WizardStep[] = [];

  if (hasRoleStep.value) {
    result.push({
      type: "role",
      title: "Výber role",
      description: "Zvoľte rolu, v ktorej sa registrujete na podujatie",
    });
  }

  if (hasTeamStep.value) {
    result.push({
      type: "team",
      title: "Tímové informácie",
      description: "Zadajte názov tímu pre tímovú účasť",
    });
  }

  if (hasGuestStep.value) {
    result.push({
      type: "guest",
      title: "Osobné a kontaktné údaje",
      description: "Vyplňte požadované identifikačné a kontaktné údaje",
    });
  }

  for (const s of visibleDynamicSections.value) {
    result.push({
      type: "section",
      sectionUuid: s.uuid,
      title: s.title || "Formulárová sekcia",
      description: `Otázky sekcie ${s.title}`,
    });
  }

  return result;
});

const currentStepIndex = ref(0);

// Keep currentStepIndex within bounds if steps change dynamically
watch(
  steps,
  (newSteps) => {
    if (currentStepIndex.value >= newSteps.length) {
      currentStepIndex.value = Math.max(0, newSteps.length - 1);
    }
  },
  { deep: true },
);

const currentStep = computed(() => steps.value[currentStepIndex.value]);

const currentSectionData = computed(() => {
  if (currentStep.value?.type !== "section") return null;
  return activeSections.value.find(
    (s) => s.uuid === (currentStep.value as any).sectionUuid,
  );
});

// Date conversion helpers for UInputDate
const toCalendarDate = (val?: string): CalendarDate | null => {
  if (!val) return null;
  try {
    return parseDate(val);
  } catch {
    return null;
  }
};

const fromCalendarDate = (val: unknown): string | undefined => {
  if (!val) return undefined;
  if (typeof val === "object" && "toString" in val) {
    return val.toString();
  }
  return String(val);
};

// Check if a collected detail is requested in event config
const isDetailRequested = (
  detail:
    | "name"
    | "surname"
    | "email"
    | "phone"
    | "birthDate"
    | "street"
    | "postalCode"
    | "town",
) => {
  return config.value?.collectedDetails?.includes(detail) ?? false;
};

// Step validation before next
const validateCurrentStep = (): boolean => {
  fieldErrors.value = {};
  const step = currentStep.value;
  if (!step) return false;

  if (step.type === "role") {
    if (
      !selectedRoleUuid.value ||
      (selectedRole.value && isRoleDisabled(selectedRole.value))
    ) {
      fieldErrors.value.role = "Prosím, vyberte si jednu z dostupných rolí.";
    }
  } else if (step.type === "team") {
    if (!teamName.value.trim()) {
      fieldErrors.value.teamName = "Prosím, zadajte názov vášho tímu.";
    }
  } else if (step.type === "guest") {
    if (!guestDetails.value.name.trim()) {
      fieldErrors.value.name = "Meno je povinné.";
    }
    if (!guestDetails.value.surname.trim()) {
      fieldErrors.value.surname = "Priezvisko je povinné.";
    }
    if (
      !guestDetails.value.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.value.email)
    ) {
      fieldErrors.value.email = "Zadajte platnú e-mailovú adresu.";
    }
    if (isDetailRequested("phone") && !guestDetails.value.phone.trim()) {
      fieldErrors.value.phone = "Telefónne číslo je povinné.";
    }
    if (isDetailRequested("birthDate") && !guestDetails.value.birthDate) {
      fieldErrors.value.birthDate = "Dátum narodenia je povinný.";
    }
    if (isDetailRequested("street") && !guestDetails.value.street.trim()) {
      fieldErrors.value.street = "Ulica a číslo sú povinné.";
    }
    if (
      isDetailRequested("postalCode") &&
      !guestDetails.value.postalCode.trim()
    ) {
      fieldErrors.value.postalCode = "PSČ je povinné.";
    }
    if (isDetailRequested("town") && !guestDetails.value.town.trim()) {
      fieldErrors.value.town = "Mesto / Obec je povinné.";
    }
  } else if (step.type === "section") {
    const s = currentSectionData.value;
    if (s) {
      for (const q of s.questions) {
        if (q.deleted) continue;
        if (q.required) {
          const val = answers.value[q.uuid];
          const isEmpty =
            val === undefined ||
            val === null ||
            val === "" ||
            (Array.isArray(val) && val.length === 0);

          if (isEmpty) {
            fieldErrors.value[q.uuid] = `Otázka "${q.title}" je povinná.`;
          }
        }
      }
    }
  }

  const hasErrors = Object.keys(fieldErrors.value).length > 0;
  if (hasErrors) {
    const firstErrorMessage = Object.values(fieldErrors.value)[0];
    toast.add({
      title: "Chýbajúce údaje",
      description: firstErrorMessage || "Vyplňte všetky povinné polia.",
      color: "error",
      icon: "i-ph-warning-circle",
    });
    return false;
  }

  return true;
};

const nextStep = () => {
  if (!validateCurrentStep()) return;

  if (currentStepIndex.value < steps.value.length - 1) {
    currentStepIndex.value++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const prevStep = () => {
  fieldErrors.value = {};
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const isLastStep = computed(
  () => currentStepIndex.value === steps.value.length - 1,
);

// Submit registration
const submitRegistration = async () => {
  if (!validateCurrentStep()) return;
  if (!selectedRole.value || isRoleDisabled(selectedRole.value)) {
    toast.add({
      title: "Neplatná rola",
      description: "Zvolená rola vyžaduje prihlásenie.",
      color: "error",
      icon: "i-ph-warning-circle",
    });
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      roleUuid: selectedRoleUuid.value,
      teamName: hasTeamStep.value ? teamName.value.trim() : undefined,
      guestDetails: !isLoggedIn.value ? guestDetails.value : undefined,
      answers: Object.entries(answers.value).map(([questionUuid, answer]) => ({
        questionUuid,
        answer,
      })),
    };

    const res = await $fetch<{
      success: boolean;
      registrationId: number;
      paymentId: string | null;
      confirmed: boolean;
    }>(`/api/events/${slug}/register`, {
      method: "POST",
      body: payload,
    });

    toast.add({
      title: "Registrácia úspešná",
      description: "Vaša registrácia na podujatie bola úspešne odoslaná.",
      color: "success",
      icon: "i-ph-check-circle",
    });

    const query: Record<string, string> = {
      reg: String(res.registrationId),
    };
    if (res.paymentId) {
      query.pay = res.paymentId;
    }
    if (!res.confirmed) {
      query.under18 = "true";
    }

    await navigateTo({
      path: `/events/${slug}/finished`,
      query,
    });
  } catch (err: any) {
    toast.add({
      title: "Chyba registrácie",
      description:
        err.data?.message ||
        err.message ||
        "Registráciu sa nepodarilo odoslať. Skúste to znova.",
      color: "error",
      icon: "i-ph-x-circle",
    });
  } finally {
    submitting.value = false;
  }
};

useSeoMeta({
  title: `Registrácia: ${event.value.name}`,
  description: `Registračný formulár na podujatie ${event.value.name}`,
});
</script>

<template>
  <UPage>
    <UPageHeader :title="`Registrácia na ${event.name}`">
      <template #links>
        <UButton
          :to="`/events/${slug}`"
          icon="i-ph-arrow-left"
          color="neutral"
          variant="subtle"
          label="Späť na podujatie" />
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- If already registered -->
      <div v-if="alreadyRegistered" class="w-full py-8">
        <UAlert
          color="info"
          variant="subtle"
          icon="i-ph-check-circle"
          title="Vašu registráciu sme už zaznamenali"
          description="Na toto podujatie už máte vytvorenú platnú registráciu. Opakovaná registrácia nie je možná.">
          <template #actions>
            <UButton
              :to="`/events/${slug}`"
              size="xs"
              color="primary"
              label="Prejsť na podujatie" />
            <UButton
              to="/profile"
              size="xs"
              color="neutral"
              variant="subtle"
              label="Moje registrácie" />
          </template>
        </UAlert>
      </div>

      <!-- If event is not platform registration -->
      <div v-else-if="!config" class="w-full py-12">
        <UAlert
          color="warning"
          variant="subtle"
          icon="i-ph-warning"
          title="Externá registrácia"
          description="Toto podujatie neprijíma registrácie priamo v systéme DebRIEF. Prosím, navštívte oficiálny externý odkaz." />
      </div>

      <!-- Main registration wizard: Full page width -->
      <div v-else class="w-full space-y-6">
        <!-- Wizard Card -->
        <UCard class="w-full shadow-sm">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-bold text-highlighted">
                  {{ currentStep?.title }}
                </h2>
                <p class="text-sm text-muted">
                  {{ currentStep?.description }}
                </p>
              </div>
              <UBadge v-if="selectedRole" color="primary" variant="subtle">
                {{ selectedRole.name }}
                <span v-if="selectedRole.cost > 0" class="ml-1 font-semibold">
                  ({{ selectedRole.cost }}€)
                </span>
              </UBadge>
            </div>
          </template>

          <!-- Step 1: Role Selection -->
          <div v-if="currentStep?.type === 'role'" class="space-y-4">
            <UAlert
              v-if="!isLoggedIn && activeRoles.some((r) => isRoleDisabled(r))"
              color="neutral"
              variant="subtle"
              icon="i-ph-info"
              title="Spoplatnené role vyžadujú prihlásenie"
              description="Registrácia do spoplatnených účastníckych rolí je dostupná len pre prihlásených používateľov.">
              <template #actions>
                <UButton
                  :to="`/auth?redirect=/events/${slug}/register`"
                  size="xs"
                  color="primary"
                  variant="subtle"
                  label="Prihlásiť sa" />
              </template>
            </UAlert>

            <UFormField
              label="Vyberte účastnícku rolu"
              required
              :error="fieldErrors.role">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <div
                  v-for="r in activeRoles"
                  :key="r.uuid"
                  class="border rounded-lg p-4 transition-colors"
                  :class="[
                    isRoleDisabled(r)
                      ? 'border-default/40 bg-muted/10 opacity-60 cursor-not-allowed'
                      : selectedRoleUuid === r.uuid
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30 cursor-pointer'
                        : 'border-default/60 hover:border-default hover:bg-elevated/40 cursor-pointer',
                  ]"
                  :aria-disabled="isRoleDisabled(r)"
                  @click="
                    if (!isRoleDisabled(r)) {
                      selectedRoleUuid = r.uuid;
                      delete fieldErrors.role;
                    }
                  ">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                      <div
                        class="size-5 rounded-full border flex items-center justify-center"
                        :class="
                          isRoleDisabled(r)
                            ? 'border-muted/40 bg-muted/20 text-muted'
                            : selectedRoleUuid === r.uuid
                              ? 'border-primary bg-primary text-white'
                              : 'border-muted'
                        ">
                        <UIcon
                          v-if="selectedRoleUuid === r.uuid"
                          name="i-ph-check"
                          class="size-3" />
                        <UIcon
                          v-else-if="isRoleDisabled(r)"
                          name="i-ph-lock"
                          class="size-2.5 text-muted" />
                      </div>
                      <div>
                        <h4
                          class="font-semibold"
                          :class="
                            isRoleDisabled(r)
                              ? 'text-muted'
                              : 'text-highlighted'
                          ">
                          {{ r.name }}
                        </h4>
                        <p class="text-xs text-muted">
                          {{
                            r.roleType === "contestant"
                              ? "Súťažiaci účastník"
                              : r.roleType === "adjudicator"
                                ? "Rozhodca / Rozhodkyňa"
                                : "Iná účasť"
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="text-right space-y-0.5">
                      <span
                        class="text-sm font-bold"
                        :class="
                          isRoleDisabled(r) ? 'text-muted' : 'text-highlighted'
                        ">
                        {{ r.cost > 0 ? `${r.cost} €` : "Bez poplatku" }}
                      </span>
                      <p
                        v-if="r.hasTeamVariant"
                        class="text-xs flex items-center gap-1 justify-end"
                        :class="
                          isRoleDisabled(r) ? 'text-muted' : 'text-primary'
                        ">
                        <UIcon name="i-ph-users-three" class="size-3.5" />
                        Tímová účasť
                      </p>
                      <p
                        v-if="isRoleDisabled(r)"
                        class="text-xs text-warning flex items-center gap-1 justify-end">
                        <UIcon name="i-ph-lock-key" class="size-3.5" />
                        Vyžaduje prihlásenie
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </UFormField>
          </div>

          <!-- Step 2: Team Details -->
          <div v-else-if="currentStep?.type === 'team'" class="space-y-4">
            <UAlert
              color="info"
              variant="subtle"
              icon="i-ph-info"
              title="Tímová registrácia"
              description="Zvolili ste rolu s možnosťou tímovej registrácie. Zadajte názov vášho tímu, pod ktorým budete evidovaní." />

            <UFormField
              label="Názov tímu"
              required
              description="Názov, pod ktorým bude tím evidovaný na podujatí"
              :error="fieldErrors.teamName">
              <UInput
                v-model="teamName"
                placeholder="Napr. Gladiátori z Gymnázia"
                size="lg"
                class="w-full"
                @input="delete fieldErrors.teamName" />
            </UFormField>
          </div>

          <!-- Step 3: Guest / Collected Details -->
          <div v-else-if="currentStep?.type === 'guest'" class="space-y-4">
            <UAlert
              color="neutral"
              variant="subtle"
              icon="i-ph-user"
              title="Registrácia bez prihlásenia"
              description="Na toto podujatie sa môžete registrovať aj bez vytvoreného účtu. Odporúčame však prihlásenie, aby ste mali prístup k vašim registráciám a platbám.">
              <template #actions>
                <UButton
                  :to="`/auth?redirect=/events/${slug}/register`"
                  size="xs"
                  color="primary"
                  variant="subtle"
                  label="Prihlásiť sa existujúcim účtom" />
              </template>
            </UAlert>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Meno" required :error="fieldErrors.name">
                <UInput
                  v-model="guestDetails.name"
                  placeholder="Ján"
                  class="w-full"
                  @input="delete fieldErrors.name" />
              </UFormField>

              <UFormField
                label="Priezvisko"
                required
                :error="fieldErrors.surname">
                <UInput
                  v-model="guestDetails.surname"
                  placeholder="Novák"
                  class="w-full"
                  @input="delete fieldErrors.surname" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField
                label="E-mailová adresa"
                required
                :error="fieldErrors.email">
                <UInput
                  v-model="guestDetails.email"
                  type="email"
                  placeholder="jan.novak@example.sk"
                  class="w-full"
                  @input="delete fieldErrors.email" />
              </UFormField>

              <UFormField
                label="Telefónne číslo"
                :required="isDetailRequested('phone')"
                :error="fieldErrors.phone">
                <UInput
                  v-model="guestDetails.phone"
                  placeholder="+421 900 000 000"
                  class="w-full"
                  @input="delete fieldErrors.phone" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField
                label="Dátum narodenia"
                :required="isDetailRequested('birthDate')"
                :description="
                  isDetailRequested('birthDate')
                    ? 'Pre účastníkov mladších ako 18 rokov je potrebné potvrdenie zákonným zástupcom'
                    : undefined
                "
                :error="fieldErrors.birthDate">
                <UInputDate
                  :model-value="toCalendarDate(guestDetails.birthDate)"
                  class="w-full"
                  @update:model-value="
                    (val) => {
                      guestDetails.birthDate = fromCalendarDate(val) || '';
                      delete fieldErrors.birthDate;
                    }
                  " />
              </UFormField>

              <UFormField
                v-if="
                  isDetailRequested('street') ||
                  isDetailRequested('town') ||
                  isDetailRequested('postalCode')
                "
                label="Ulica a číslo"
                :required="isDetailRequested('street')"
                :error="fieldErrors.street">
                <UInput
                  v-model="guestDetails.street"
                  placeholder="Hlavná 123"
                  class="w-full"
                  @input="delete fieldErrors.street" />
              </UFormField>
            </div>

            <div
              v-if="
                isDetailRequested('postalCode') || isDetailRequested('town')
              "
              class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField
                label="PSČ"
                :required="isDetailRequested('postalCode')"
                :error="fieldErrors.postalCode">
                <UInput
                  v-model="guestDetails.postalCode"
                  placeholder="811 01"
                  class="w-full"
                  @input="delete fieldErrors.postalCode" />
              </UFormField>

              <UFormField
                label="Mesto / Obec"
                :required="isDetailRequested('town')"
                :error="fieldErrors.town">
                <UInput
                  v-model="guestDetails.town"
                  placeholder="Bratislava"
                  class="w-full"
                  @input="delete fieldErrors.town" />
              </UFormField>
            </div>
          </div>

          <!-- Step 4+: Dynamic Form Sections -->
          <div
            v-else-if="currentStep?.type === 'section' && currentSectionData"
            class="space-y-6">
            <div
              v-if="
                currentSectionData.questions.filter((q) => !q.deleted)
                  .length === 0
              "
              class="py-6 text-center text-muted text-sm">
              V tejto sekcii sa nenachádzajú žiadne doplňujúce otázky. Môžete
              pokračovať ďalej.
            </div>

            <div
              v-for="q in currentSectionData.questions.filter(
                (q) => !q.deleted,
              )"
              :key="q.uuid"
              class="space-y-1.5">
              <!-- Text Question -->
              <UFormField
                v-if="q.type === 'text'"
                :label="q.title"
                :required="q.required"
                :description="q.description"
                :error="fieldErrors[q.uuid]">
                <UInput
                  v-model="answers[q.uuid]"
                  placeholder="Vaša odpoveď..."
                  class="w-full"
                  @input="delete fieldErrors[q.uuid]" />
              </UFormField>

              <!-- Number Question -->
              <UFormField
                v-else-if="q.type === 'number'"
                :label="q.title"
                :required="q.required"
                :description="q.description"
                :error="fieldErrors[q.uuid]">
                <UInput
                  v-model.number="answers[q.uuid]"
                  type="number"
                  placeholder="0"
                  class="w-full"
                  @input="delete fieldErrors[q.uuid]" />
              </UFormField>

              <!-- Date Question -->
              <UFormField
                v-else-if="q.type === 'date'"
                :label="q.title"
                :required="q.required"
                :description="q.description"
                :error="fieldErrors[q.uuid]">
                <UInputDate
                  :model-value="toCalendarDate(answers[q.uuid])"
                  class="w-full"
                  @update:model-value="
                    (val) => {
                      answers[q.uuid] = fromCalendarDate(val);
                      delete fieldErrors[q.uuid];
                    }
                  " />
              </UFormField>

              <!-- Boolean Question -->
              <UFormField
                v-else-if="q.type === 'boolean'"
                :label="q.title"
                :required="q.required"
                :description="q.description"
                :error="fieldErrors[q.uuid]">
                <div class="pt-1">
                  <UCheckbox
                    v-model="answers[q.uuid]"
                    label="Áno"
                    variant="card"
                    @change="delete fieldErrors[q.uuid]" />
                </div>
              </UFormField>

              <!-- Select Question: using URadioGroup -->
              <UFormField
                v-else-if="q.type === 'select'"
                :label="q.title"
                :required="q.required"
                :description="q.description"
                :error="fieldErrors[q.uuid]">
                <URadioGroup
                  v-model="answers[q.uuid]"
                  :items="q.options"
                  color="primary"
                  class="space-y-2 pt-1"
                  variant="card"
                  @update:model-value="delete fieldErrors[q.uuid]" />
              </UFormField>

              <!-- MultiSelect Question: using UCheckboxGroup -->
              <UFormField
                v-else-if="q.type === 'multiselect'"
                :label="q.title"
                :required="q.required"
                :description="q.description"
                :error="fieldErrors[q.uuid]">
                <UCheckboxGroup
                  v-model="answers[q.uuid]"
                  :items="q.options"
                  color="primary"
                  class="space-y-2 pt-1"
                  variant="card"
                  @update:model-value="delete fieldErrors[q.uuid]" />
              </UFormField>
            </div>
          </div>

          <!-- Card Footer with Stepper Navigation -->
          <template #footer>
            <div class="flex items-center justify-between gap-4">
              <UButton
                v-if="currentStepIndex > 0"
                icon="i-ph-arrow-left"
                color="neutral"
                variant="subtle"
                label="Späť"
                @click="prevStep" />
              <div v-else />

              <div class="flex items-center gap-3">
                <UButton
                  v-if="!isLastStep"
                  trailing-icon="i-ph-arrow-right"
                  color="primary"
                  label="Pokračovať"
                  @click="nextStep" />

                <UButton
                  v-else
                  icon="i-ph-paper-plane-tilt"
                  color="primary"
                  :loading="submitting"
                  label="Odoslať registráciu"
                  @click="submitRegistration" />
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>
