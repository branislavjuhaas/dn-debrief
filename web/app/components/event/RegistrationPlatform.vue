<script setup lang="ts">
import type {
  RegistrationRole,
  RegistrationSection,
  RegistrationQuestion,
} from "#shared/types/event";
import {
  COLLECTED_DETAILS_OPTIONS,
  type PlatformRegistrationConfig,
} from "#shared/utils/events";

const model = defineModel<PlatformRegistrationConfig>({
  default: () => {
    const defaultSectionUuid = crypto.randomUUID();
    return {
      roles: [
        {
          uuid: crypto.randomUUID(),
          name: "Debatér/-ka",
          cost: 0,
          roleType: "contestant",
          credentialRequirements: "none",
        },
        {
          uuid: crypto.randomUUID(),
          name: "Rozhodca/-kyňa",
          cost: 0,
          roleType: "adjudicator",
          credentialRequirements: "adjudicator",
        },
      ],
      requireAccount: true,
      requireMembership: true,
      collectedDetails: ["name", "surname", "email", "phone"],
      sections: [
        {
          uuid: defaultSectionUuid,
          title: "Základné informácie",
          questions: [],
        },
      ],
      fallbackStartSection: defaultSectionUuid,
    };
  },
});

const validate = async () => {
  const activeRoles = model.value.roles.filter(
    (r: RegistrationRole) => !r.deleted,
  );
  if (activeRoles.length === 0) {
    return false;
  }
  if (!model.value.fallbackStartSection) {
    return false;
  }
  return true;
};

defineExpose({
  validate,
});

const activeRoles = computed(() =>
  model.value.roles.filter((r: RegistrationRole) => !r.deleted),
);

const activeSections = computed(() =>
  model.value.sections.filter((s: RegistrationSection) => !s.deleted),
);

// Add new role
const addRole = () => {
  model.value.roles.push({
    uuid: crypto.randomUUID(),
    name: "Nová rola",
    cost: 0,
    roleType: "other",
    credentialRequirements: "none",
  });
};

const removeRole = (uuid: string) => {
  const role = model.value.roles.find((r: RegistrationRole) => r.uuid === uuid);
  if (role) {
    role.deleted = true;
  }
};

// Add new section
const addSection = () => {
  const newUuid = crypto.randomUUID();
  model.value.sections.push({
    uuid: newUuid,
    title: `Sekcia ${activeSections.value.length + 1}`,
    questions: [],
  });
  if (!model.value.fallbackStartSection) {
    model.value.fallbackStartSection = newUuid;
  }
};

const removeSection = (uuid: string) => {
  const section = model.value.sections.find(
    (s: RegistrationSection) => s.uuid === uuid,
  );
  if (section) {
    section.deleted = true;
  }
  if (model.value.fallbackStartSection === uuid) {
    const nextSection = activeSections.value.find(
      (s: RegistrationSection) => s.uuid !== uuid,
    );
    model.value.fallbackStartSection = nextSection?.uuid ?? "";
  }
};

// Add question to a section
const addQuestion = (sectionUuid: string) => {
  const section = model.value.sections.find(
    (s: RegistrationSection) => s.uuid === sectionUuid,
  );
  if (!section) return;

  section.questions.push({
    uuid: crypto.randomUUID(),
    title: "Otázka",
    type: "text",
    required: false,
  });
};

const removeQuestion = (sectionUuid: string, questionUuid: string) => {
  const section = model.value.sections.find(
    (s: RegistrationSection) => s.uuid === sectionUuid,
  );
  if (!section) return;

  const question = section.questions.find(
    (q: RegistrationQuestion) => q.uuid === questionUuid,
  );
  if (question) {
    question.deleted = true;
  }
};

const roleTypeOptions = [
  { label: "Súťažiaci/-a", value: "contestant" },
  { label: "Rozhodca/-kyňa", value: "adjudicator" },
  { label: "Iná typ úcasti", value: "other" },
];

const credentialOptions = [
  { label: "Neaplikovateľné", value: "none" },
  { label: "Rozhodcovská akreditácia", value: "adjudicator" },
  { label: "Žiadna rozh. akreditácia", value: "non-adjudicator" },
];

const questionTypeOptions = [
  { label: "Krátky text", value: "text" },
  { label: "Číslo", value: "number" },
  { label: "Dátum", value: "date" },
  { label: "Áno / Nie (zaškrtávacie pole)", value: "boolean" },
  { label: "Výber z možností", value: "select" },
];
</script>

<template>
  <div class="flex flex-col gap-8 w-full">
    <!-- General in-platform registration settings -->
    <div class="space-y-4">
      <h3 class="text-base font-semibold">Všeobecné pravidlá registrácie</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <USwitch
          v-model="model.requireAccount"
          label="Vyžadovať účet v systéme"
          description="Každý účastník musí byť prihlásený" />

        <USwitch
          v-model="model.requireMembership"
          label="Vyžadovať členstvo v SDA"
          description="Podmienka aktívneho členstva pre aktuálnu sezónu" />
      </div>
    </div>

    <USeparator />

    <!-- Roles & Fees -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold">Účastnícke role a poplatky</h3>
          <p class="text-sm text-muted">
            Definujte role, do ktorých sa účastníci môžu prihlásiť (napr.
            debatér, rozhodca).
          </p>
        </div>
        <UButton
          icon="i-ph-plus"
          label="Pridať rolu"
          color="primary"
          variant="soft"
          @click="addRole" />
      </div>

      <div class="space-y-3">
        <UCard
          v-for="role in activeRoles"
          :key="role.uuid"
          :ui="{ body: 'p-4 sm:p-4' }">
          <div
            class="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <UFormField label="Názov role" class="flex-1">
              <UInput
                v-model="role.name"
                placeholder="napr. Debatér"
                class="w-full" />
            </UFormField>

            <UFormField label="Typ role" class="w-full md:w-56">
              <USelect
                v-model="role.roleType"
                :items="roleTypeOptions"
                class="w-full" />
            </UFormField>

            <UFormField label="Kvalifikácia" class="w-full md:w-56">
              <USelect
                v-model="role.credentialRequirements"
                :items="credentialOptions"
                class="w-full" />
            </UFormField>

            <div class="flex flex-row max-md:w-full gap-2">
              <UFormField label="Poplatok (€)" class="w-full md:w-32">
                <UInputNumber v-model="role.cost" :min="0" class="w-full" />
              </UFormField>

              <div class="flex self-end h-[calc(100%+1px)]">
                <UButton
                  icon="i-ph-trash-simple"
                  color="error"
                  variant="ghost"
                  :disabled="activeRoles.length <= 1"
                  @click="removeRole(role.uuid)" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <USeparator />

    <!-- Profile Details Collection -->
    <div class="space-y-4">
      <div>
        <h3 class="text-base font-semibold">Požadované profilové údaje</h3>
        <p class="text-sm text-muted">
          Vyberte informácie z používateľského profilu, ktoré systém automaticky
          overí alebo vyžiada pri registrácii.
        </p>
      </div>

      <UCheckboxGroup
        v-model="model.collectedDetails"
        color="primary"
        variant="card"
        value-key="value"
        :items="COLLECTED_DETAILS_OPTIONS"
        :ui="{
          fieldset:
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3',
        }" />
    </div>

    <USeparator />

    <!-- Custom Sections & Questions Form Builder -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold">Vlastné sekcie a otázky</h3>
          <p class="text-sm text-muted">
            Dodatočné otázky pre účastníkov (napr. diéta, ubytovanie,
            preferencie).
          </p>
        </div>
        <UButton
          icon="i-ph-plus"
          label="Pridať sekciu"
          color="neutral"
          variant="soft"
          size="sm"
          @click="addSection" />
      </div>

      <div class="space-y-4">
        <UCard
          v-for="section in activeSections"
          :key="section.uuid"
          class="border border-default"
          :ui="{ body: 'space-y-4 p-4 sm:p-5' }">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 flex-1">
              <UIcon name="i-ph-folder" class="text-primary text-xl" />
              <UInput
                v-model="section.title"
                placeholder="Názov sekcie"
                class="font-semibold max-w-sm" />
            </div>
            <div class="flex items-center gap-2">
              <UBadge
                v-if="model.fallbackStartSection === section.uuid"
                size="md"
                color="primary"
                variant="subtle"
                trailing-icon="i-ph-checks"
                class="px-2.5 py-1.5">
                Predvolená sekcia
              </UBadge>
              <UButton
                v-else
                size="sm"
                variant="outline"
                color="neutral"
                label="Nastaviť ako predvolenú"
                trailing-icon="i-ph-house"
                @click="model.fallbackStartSection = section.uuid" />
              <UButton
                icon="i-ph-trash-simple"
                variant="ghost"
                color="error"
                :disabled="activeSections.length <= 1"
                @click="removeSection(section.uuid)" />
            </div>
          </div>

          <!-- Questions inside this section -->
          <div class="space-y-2 pl-4 border-l-2 border-muted">
            <div
              v-for="q in section.questions.filter(
                (q: RegistrationQuestion) => !q.deleted,
              )"
              :key="q.uuid"
              class="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-muted/40">
              <UInput
                v-model="q.title"
                placeholder="Znenie otázky"
                class="flex-1 w-full" />
              <USelect
                v-model="q.type"
                :items="questionTypeOptions"
                class="w-full sm:w-48" />
              <div class="flex items-center gap-3 shrink-0">
                <USwitch v-model="q.required" label="Povinné" />
                <UButton
                  icon="i-ph-x"
                  size="xs"
                  color="error"
                  variant="ghost"
                  @click="removeQuestion(section.uuid, q.uuid)" />
              </div>
            </div>

            <UButton
              icon="i-ph-plus"
              label="Pridať otázku"
              variant="subtle"
              color="neutral"
              size="sm"
              class="w-full mt-2"
              @click="addQuestion(section.uuid)" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
