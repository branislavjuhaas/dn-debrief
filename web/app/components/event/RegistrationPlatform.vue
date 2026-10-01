<script setup lang="ts">
import {
  CalendarDateTime,
  type DateValue,
  getLocalTimeZone,
  parseAbsoluteToLocal,
  toCalendarDateTime,
} from "@internationalized/date";
import type {
  RegistrationRole,
  RegistrationSection,
  RegistrationQuestion,
  RegistrationRule,
} from "#shared/types/event";
import {
  COLLECTED_DETAILS_OPTIONS,
  ROLE_CONDITION_QUESTION_UUID,
  type PlatformRegistrationConfig,
} from "#shared/utils/events";

const model = defineModel<PlatformRegistrationConfig>({
  default: () => {
    const defaultSectionUuid = crypto.randomUUID();
    const debaterRoleUuid = crypto.randomUUID();
    const adjudicatorRoleUuid = crypto.randomUUID();
    return {
      roles: [
        {
          uuid: debaterRoleUuid,
          name: "Debatér/-ka",
          cost: 0,
          roleType: "contestant",
          credentialRequirements: "none",
        },
        {
          uuid: adjudicatorRoleUuid,
          name: "Rozhodca/-kyňa",
          cost: 0,
          roleType: "adjudicator",
          credentialRequirements: "adjudicator",
        },
      ],
      requireAccount: true,
      requireMembership: true,
      softDeadline: undefined,
      collectedDetails: ["name", "surname", "email", "phone"],
      sections: [
        {
          uuid: defaultSectionUuid,
          title: "Základné informácie",
          questions: [],
        },
      ],
      conditionalStartSections: [
        { roleUuid: debaterRoleUuid, sectionUuid: defaultSectionUuid },
        { roleUuid: adjudicatorRoleUuid, sectionUuid: defaultSectionUuid },
      ],
      fallbackStartSection: defaultSectionUuid,
    };
  },
});

const toCalendarDateTimeValue = (raw?: string): CalendarDateTime | null => {
  if (!raw) return null;
  try {
    const iso =
      raw.endsWith("Z") || raw.includes("+")
        ? raw
        : new Date(raw).toISOString();
    return toCalendarDateTime(parseAbsoluteToLocal(iso));
  } catch {
    return null;
  }
};

const fromCalendarDateTimeValue = (val: unknown): string | undefined => {
  if (!val) return undefined;
  if (
    typeof val === "object" &&
    "toDate" in val &&
    typeof (val as { toDate?: unknown }).toDate === "function"
  ) {
    return (val as { toDate: (tz: string) => Date })
      .toDate(getLocalTimeZone())
      .toISOString();
  }
  return new Date(String(val)).toISOString();
};

const softDeadline = computed<CalendarDateTime | null>({
  get: () => toCalendarDateTimeValue(model.value.softDeadline),
  set: (val) => {
    model.value.softDeadline = fromCalendarDateTimeValue(val);
  },
});

const activeRoles = computed(() =>
  model.value.roles.filter((r: RegistrationRole) => !r.deleted),
);

const activeSections = computed(() =>
  model.value.sections.filter((s: RegistrationSection) => !s.deleted),
);

// Keep fallbackStartSection always synced to first active section
watch(
  activeSections,
  (sections) => {
    if (sections.length > 0) {
      if (
        !model.value.fallbackStartSection ||
        !sections.some((s) => s.uuid === model.value.fallbackStartSection)
      ) {
        model.value.fallbackStartSection = sections[0]!.uuid;
      }
    }
  },
  { immediate: true },
);

const findQuestion = (
  questionUuid: string,
): RegistrationQuestion | undefined => {
  for (const s of model.value.sections) {
    const q = s.questions.find((item) => item.uuid === questionUuid);
    if (q) return q;
  }
  return undefined;
};

const isChoiceQuestion = (
  q: RegistrationQuestion,
): q is Extract<
  RegistrationQuestion,
  { type: "select" | "multiselect"; options: string[] }
> => {
  return q.type === "select" || q.type === "multiselect";
};

// Add new role
const addRole = () => {
  const newRoleUuid = crypto.randomUUID();
  model.value.roles.push({
    uuid: newRoleUuid,
    name: "Nová rola",
    cost: 0,
    roleType: "other",
    credentialRequirements: "none",
  });

  const firstSection = activeSections.value[0];
  if (firstSection) {
    if (!model.value.conditionalStartSections) {
      model.value.conditionalStartSections = [];
    }
    model.value.conditionalStartSections.push({
      roleUuid: newRoleUuid,
      sectionUuid: firstSection.uuid,
    });
  }
};

const removeRole = (uuid: string) => {
  const role = model.value.roles.find((r: RegistrationRole) => r.uuid === uuid);
  if (role) {
    role.deleted = true;
  }
  if (model.value.conditionalStartSections) {
    model.value.conditionalStartSections =
      model.value.conditionalStartSections.filter((c) => c.roleUuid !== uuid);
  }
};

// Section management & repositioning
const addSection = () => {
  const newUuid = crypto.randomUUID();
  model.value.sections.push({
    uuid: newUuid,
    title: `Sekcia ${activeSections.value.length + 1}`,
    questions: [],
  });
  if (!model.value.fallbackStartSection && activeSections.value.length > 0) {
    model.value.fallbackStartSection = activeSections.value[0]!.uuid;
  }
};

const moveSection = (uuid: string, direction: "up" | "down") => {
  const activeList = activeSections.value;
  const currentActiveIdx = activeList.findIndex((s) => s.uuid === uuid);
  if (currentActiveIdx === -1) return;

  const targetActiveIdx =
    direction === "up" ? currentActiveIdx - 1 : currentActiveIdx + 1;
  if (targetActiveIdx < 0 || targetActiveIdx >= activeList.length) return;

  const targetSection = activeList[targetActiveIdx]!;

  const fromIdx = model.value.sections.findIndex((s) => s.uuid === uuid);
  const toIdx = model.value.sections.findIndex(
    (s) => s.uuid === targetSection.uuid,
  );
  if (fromIdx === -1 || toIdx === -1) return;

  const [moved] = model.value.sections.splice(fromIdx, 1);
  if (moved) {
    model.value.sections.splice(toIdx, 0, moved);
  }

  const firstActive = activeSections.value[0];
  if (firstActive) {
    model.value.fallbackStartSection = firstActive.uuid;
  }
};

const removeSection = (uuid: string) => {
  const section = model.value.sections.find(
    (s: RegistrationSection) => s.uuid === uuid,
  );
  if (section) {
    section.deleted = true;
  }
  const remaining = activeSections.value;
  if (model.value.fallbackStartSection === uuid) {
    model.value.fallbackStartSection = remaining[0]?.uuid ?? "";
  }
  if (model.value.conditionalStartSections) {
    model.value.conditionalStartSections =
      model.value.conditionalStartSections.filter(
        (c) => c.sectionUuid !== uuid,
      );
  }
};

// Starting section per role helpers
const getRoleStartSection = (roleUuid: string): string => {
  const mapping = model.value.conditionalStartSections?.find(
    (c) => c.roleUuid === roleUuid,
  );
  if (
    mapping &&
    activeSections.value.some((s) => s.uuid === mapping.sectionUuid)
  ) {
    return mapping.sectionUuid;
  }
  return activeSections.value[0]?.uuid ?? "";
};

const setRoleStartSection = (roleUuid: string, sectionUuid: string) => {
  if (!model.value.conditionalStartSections) {
    model.value.conditionalStartSections = [];
  }
  const idx = model.value.conditionalStartSections.findIndex(
    (c) => c.roleUuid === roleUuid,
  );

  if (idx !== -1) {
    model.value.conditionalStartSections[idx]!.sectionUuid = sectionUuid;
  } else {
    model.value.conditionalStartSections.push({
      roleUuid,
      sectionUuid,
    });
  }
};

const sectionSelectOptions = computed(() => {
  return activeSections.value.map((s, idx) => ({
    label: `${idx + 1}. ${s.title || "Bez názvu"}`,
    value: s.uuid,
  }));
});

// Questions management & repositioning
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

const moveQuestion = (
  sectionUuid: string,
  questionUuid: string,
  direction: "up" | "down",
) => {
  const section = model.value.sections.find((s) => s.uuid === sectionUuid);
  if (!section) return;

  const activeQuestions = section.questions.filter((q) => !q.deleted);
  const currentActiveIdx = activeQuestions.findIndex(
    (q) => q.uuid === questionUuid,
  );
  if (currentActiveIdx === -1) return;

  const targetActiveIdx =
    direction === "up" ? currentActiveIdx - 1 : currentActiveIdx + 1;
  if (targetActiveIdx < 0 || targetActiveIdx >= activeQuestions.length) return;

  const targetQ = activeQuestions[targetActiveIdx]!;

  const fromIdx = section.questions.findIndex((q) => q.uuid === questionUuid);
  const toIdx = section.questions.findIndex((q) => q.uuid === targetQ.uuid);
  if (fromIdx === -1 || toIdx === -1) return;

  const [moved] = section.questions.splice(fromIdx, 1);
  if (moved) {
    section.questions.splice(toIdx, 0, moved);
  }
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

const onQuestionTypeChange = (
  question: RegistrationQuestion,
  newType: string,
) => {
  (question as any).type = newType;
  if (newType === "select" || newType === "multiselect") {
    if (
      !("options" in question) ||
      !Array.isArray((question as any).options) ||
      (question as any).options.length === 0
    ) {
      (question as any).options = ["Možnosť 1", "Možnosť 2"];
    }
  } else {
    delete (question as any).options;
  }
};

const addQuestionOption = (question: RegistrationQuestion) => {
  if (!("options" in question) || !Array.isArray((question as any).options)) {
    (question as any).options = [];
  }
  (question as any).options.push(
    `Možnosť ${(question as any).options.length + 1}`,
  );
};

const updateQuestionOption = (
  question: RegistrationQuestion,
  optIndex: number,
  val: string,
) => {
  if ("options" in question && Array.isArray((question as any).options)) {
    (question as any).options[optIndex] = val;
  }
};

const removeQuestionOption = (
  question: RegistrationQuestion,
  optIndex: number,
) => {
  if (
    "options" in question &&
    Array.isArray((question as any).options) &&
    (question as any).options.length > 1
  ) {
    (question as any).options.splice(optIndex, 1);
  }
};

const moveQuestionOption = (
  question: RegistrationQuestion,
  fromIndex: number,
  direction: "up" | "down",
) => {
  if (!("options" in question) || !Array.isArray((question as any).options))
    return;
  const targetIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  const options = (question as any).options as string[];
  if (targetIndex < 0 || targetIndex >= options.length) return;
  const [item] = options.splice(fromIndex, 1);
  if (item !== undefined) {
    options.splice(targetIndex, 0, item);
  }
};

// Section conditions (visibleWhen)
const roleConditionOptions = computed(() =>
  activeRoles.value.map((r) => ({
    label: r.name || "Bez názvu",
    value: r.uuid,
  })),
);

const booleanConditionOptions = [
  { label: "Áno", value: "true" },
  { label: "Nie", value: "false" },
];

const getQuestionSelectOptions = (questionUuid: string) => {
  const q = findQuestion(questionUuid);
  if (!q || !("options" in q) || !Array.isArray((q as any).options)) {
    return [];
  }
  return (q as any).options
    .filter((opt: string) => Boolean(opt && opt.trim()))
    .map((opt: string) => ({
      label: opt,
      value: opt,
    }));
};

const getQuestionOptionsList = (questionUuid: string): string[] => {
  const q = findQuestion(questionUuid);
  if (!q || !("options" in q) || !Array.isArray((q as any).options)) {
    return [];
  }
  return (q as any).options.filter((o: string) => Boolean(o && o.trim()));
};

const isRoleSelected = (rule: RegistrationRule, roleUuid: string): boolean => {
  if (Array.isArray(rule.value)) {
    return rule.value.includes(roleUuid);
  }
  return rule.value === roleUuid;
};

const toggleRoleInRule = (rule: RegistrationRule, roleUuid: string) => {
  if (!Array.isArray(rule.value)) {
    (rule as any).value =
      rule.value !== null && rule.value !== undefined ? [rule.value] : [];
  }
  const arr = (rule as any).value as string[];
  const idx = arr.indexOf(roleUuid);
  if (idx !== -1) {
    if (arr.length > 1) {
      arr.splice(idx, 1);
    }
  } else {
    arr.push(roleUuid);
  }
};

const isOptionSelected = (rule: RegistrationRule, option: string): boolean => {
  if (Array.isArray(rule.value)) {
    return rule.value.includes(option);
  }
  return rule.value === option;
};

const toggleOptionInRule = (rule: RegistrationRule, option: string) => {
  if (!Array.isArray(rule.value)) {
    (rule as any).value =
      rule.value !== null && rule.value !== undefined ? [rule.value] : [];
  }
  const arr = (rule as any).value as string[];
  const idx = arr.indexOf(option);
  if (idx !== -1) {
    if (arr.length > 1) {
      arr.splice(idx, 1);
    }
  } else {
    arr.push(option);
  }
};

const getArrayRuleValue = (rule: RegistrationRule): string[] => {
  if (Array.isArray(rule.value)) {
    return rule.value.map(String);
  }
  if (rule.value !== null && rule.value !== undefined && rule.value !== "") {
    return [String(rule.value)];
  }
  return [];
};

const setArrayRuleValue = (rule: RegistrationRule, val: string[]) => {
  (rule as any).value = val;
};

const getConditionSourcesForSection = (sectionUuid: string) => {
  const sources: Array<{ label: string; value: string }> = [
    { label: "Účastnícka rola", value: ROLE_CONDITION_QUESTION_UUID },
  ];

  for (const [idx, s] of activeSections.value.entries()) {
    if (s.uuid === sectionUuid) continue;
    const activeQuestions = s.questions.filter((q) => !q.deleted);
    for (const q of activeQuestions) {
      sources.push({
        label: `[${idx + 1}. ${s.title || "Sekcia"}] ${q.title || "Bez názvu"}`,
        value: q.uuid,
      });
    }
  }

  return sources;
};

const getOperatorOptions = (sourceUuid: string) => {
  if (sourceUuid === ROLE_CONDITION_QUESTION_UUID) {
    return [
      { label: "Rovná sa", value: "equals" },
      { label: "Nerovná sa", value: "not_equals" },
      { label: "Je jedno z", value: "in" },
      { label: "Nie je jedno z", value: "not_in" },
    ];
  }

  const q = findQuestion(sourceUuid);
  if (!q) {
    return [
      { label: "Rovná sa", value: "equals" },
      { label: "Nerovná sa", value: "not_equals" },
    ];
  }

  if (q.type === "select" || q.type === "multiselect") {
    return [
      { label: "Rovná sa", value: "equals" },
      { label: "Nerovná sa", value: "not_equals" },
      { label: "Je jedno z", value: "in" },
      { label: "Nie je jedno z", value: "not_in" },
    ];
  }

  if (q.type === "text" || q.type === "number") {
    return [
      { label: "Rovná sa", value: "equals" },
      { label: "Nerovná sa", value: "not_equals" },
      { label: "Je jedno z", value: "in" },
      { label: "Nie je jedno z", value: "not_in" },
    ];
  }

  return [
    { label: "Rovná sa", value: "equals" },
    { label: "Nerovná sa", value: "not_equals" },
  ];
};

const getDefaultRuleValue = (
  sourceUuid: string,
  operator: "equals" | "not_equals" | "in" | "not_in",
): any => {
  const isArray = operator === "in" || operator === "not_in";

  if (sourceUuid === ROLE_CONDITION_QUESTION_UUID) {
    const firstRole = activeRoles.value[0]?.uuid ?? "";
    return isArray ? (firstRole ? [firstRole] : []) : firstRole;
  }

  const q = findQuestion(sourceUuid);
  if (!q) {
    return isArray ? [] : "";
  }

  if (q.type === "boolean") {
    return isArray ? [true] : true;
  }

  if (q.type === "select" || q.type === "multiselect") {
    const firstOpt = (q as any).options?.[0] ?? "";
    return isArray ? (firstOpt ? [firstOpt] : []) : firstOpt;
  }

  if (q.type === "number") {
    return isArray ? [0] : 0;
  }

  return isArray ? [] : "";
};

const onRuleSourceChange = (rule: RegistrationRule, newSourceUuid: string) => {
  rule.questionUuid = newSourceUuid;
  const availableOps = getOperatorOptions(newSourceUuid).map((o) => o.value);
  if (!availableOps.includes(rule.operator)) {
    (rule as any).operator = "equals";
  }
  (rule as any).value = getDefaultRuleValue(newSourceUuid, rule.operator);
};

const onRuleOperatorChange = (
  rule: RegistrationRule,
  newOperator: "equals" | "not_equals" | "in" | "not_in",
) => {
  const wasArray = rule.operator === "in" || rule.operator === "not_in";
  const isArray = newOperator === "in" || newOperator === "not_in";
  (rule as any).operator = newOperator;

  if (isArray && !wasArray) {
    if (rule.value !== null && rule.value !== undefined && rule.value !== "") {
      (rule as any).value = [rule.value as any];
    } else {
      (rule as any).value = getDefaultRuleValue(rule.questionUuid, newOperator);
    }
  } else if (!isArray && wasArray) {
    if (Array.isArray(rule.value) && rule.value.length > 0) {
      (rule as any).value = rule.value[0] as any;
    } else {
      (rule as any).value = getDefaultRuleValue(rule.questionUuid, newOperator);
    }
  }
};

const addSectionRule = (section: RegistrationSection) => {
  if (!section.visibleWhen) {
    section.visibleWhen = [];
  }
  const sources = getConditionSourcesForSection(section.uuid);
  const firstSource = sources[0]?.value ?? ROLE_CONDITION_QUESTION_UUID;
  section.visibleWhen.push({
    questionUuid: firstSource,
    operator: "equals",
    value: getDefaultRuleValue(firstSource, "equals"),
    thenUuid: section.uuid,
  });
};

const removeSectionRule = (section: RegistrationSection, ruleIndex: number) => {
  if (section.visibleWhen) {
    section.visibleWhen.splice(ruleIndex, 1);
    if (section.visibleWhen.length === 0) {
      delete section.visibleWhen;
    }
  }
};

// Validation & cleanup
const validate = async () => {
  const roles = model.value.roles.filter((r: RegistrationRole) => !r.deleted);
  if (roles.length === 0) {
    return false;
  }
  if (roles.some((r) => !r.name?.trim())) {
    return false;
  }

  const sections = model.value.sections.filter(
    (s: RegistrationSection) => !s.deleted,
  );
  if (sections.length === 0) {
    return false;
  }

  if (
    !model.value.fallbackStartSection ||
    !sections.some((s) => s.uuid === model.value.fallbackStartSection)
  ) {
    model.value.fallbackStartSection = sections[0]!.uuid;
  }

  if (sections.some((s) => !s.title?.trim())) {
    return false;
  }

  // Validate questions and cleanup options
  for (const s of sections) {
    const activeQuestions = s.questions.filter((q) => !q.deleted);
    for (const q of activeQuestions) {
      if (!q.title?.trim()) {
        return false;
      }
      if (q.type === "select" || q.type === "multiselect") {
        const choiceQ = q as Extract<
          RegistrationQuestion,
          { type: "select" | "multiselect" }
        >;
        choiceQ.options = (choiceQ.options ?? [])
          .map((o) => o.trim())
          .filter(Boolean);
        if (choiceQ.options.length === 0) {
          choiceQ.options = ["Možnosť 1"];
        }
      }
      if (q.description && !q.description.trim()) {
        delete q.description;
      }
    }

    // Validate section conditions
    if (s.visibleWhen) {
      s.visibleWhen = s.visibleWhen.filter((rule) => {
        if (rule.questionUuid === ROLE_CONDITION_QUESTION_UUID) {
          return roles.length > 0;
        }
        const q = findQuestion(rule.questionUuid);
        return q && !q.deleted;
      });

      for (const rule of s.visibleWhen) {
        rule.thenUuid = s.uuid;
        if (rule.operator === "in" || rule.operator === "not_in") {
          if (!Array.isArray(rule.value) || rule.value.length === 0) {
            rule.value = [
              getDefaultRuleValue(rule.questionUuid, rule.operator),
            ].flat();
          }
        }
      }

      if (s.visibleWhen.length === 0) {
        delete s.visibleWhen;
      }
    }
  }

  // Cleanup conditionalStartSections
  if (model.value.conditionalStartSections) {
    model.value.conditionalStartSections =
      model.value.conditionalStartSections.filter(
        (c) =>
          roles.some((r) => r.uuid === c.roleUuid) &&
          sections.some((s) => s.uuid === c.sectionUuid),
      );
  }

  // Cleanup softDeadline if empty
  if (model.value.softDeadline && !model.value.softDeadline.trim()) {
    delete model.value.softDeadline;
  }

  // Cleanup hardDeadlines if empty
  for (const r of model.value.roles) {
    if (r.hardDeadline && !r.hardDeadline.trim()) {
      delete r.hardDeadline;
    }
  }

  return true;
};

defineExpose({
  validate,
});

const roleTypeOptions = [
  { label: "Súťažiaci/-a", value: "contestant" },
  { label: "Rozhodca/-kyňa", value: "adjudicator" },
  { label: "Iný typ účasti", value: "other" },
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
  { label: "Výber jednej možnosti", value: "select" },
  { label: "Výber viacerých možností", value: "multiselect" },
];
</script>

<template>
  <div class="flex flex-col gap-8 w-full">
    <!-- General in-platform registration settings -->
    <div class="space-y-4">
      <h3 class="text-base font-semibold">Všeobecné pravidlá registrácie</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <USwitch
          v-model="model.requireAccount"
          label="Vyžadovať účet v systéme"
          description="Každý účastník musí byť prihlásený" />

        <USwitch
          v-model="model.requireMembership"
          label="Vyžadovať členstvo v SDA"
          description="Podmienka aktívneho členstva pre aktuálnu sezónu" />

        <UFormField
          label="Deadline registrácie"
          description="Dátum a čas, po ktorom sa registrácia pre účastníkov uzavrie">
          <UInputDate
            v-model="softDeadline"
            granularity="minute"
            class="w-full" />
        </UFormField>
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
            debatér, rozhodca). Každej role môžete nastaviť počiatočnú sekciu
            registrácie.
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
          :ui="{ body: 'p-4 sm:p-4 space-y-3' }">
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

          <!-- Starting Section per Role & Hard Deadline -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-default/40">
            <UFormField
              label="Počiatočná sekcia"
              description="Sekcia, od ktorej účastník s touto rolou začne registračný formulár">
              <USelect
                :model-value="getRoleStartSection(role.uuid)"
                :items="sectionSelectOptions"
                class="w-full"
                @update:model-value="
                  (val) => setRoleStartSection(role.uuid, val as string)
                " />
            </UFormField>

            <UFormField
              label="Uzávierka role (hard deadline)"
              description="Špecifický termín uzávierky pre túto rolu (nepovinné)">
              <UInputDate
                :model-value="toCalendarDateTimeValue(role.hardDeadline)"
                granularity="minute"
                class="w-full"
                @update:model-value="
                  (val) => (role.hardDeadline = fromCalendarDateTimeValue(val))
                " />
            </UFormField>
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
            preferencie). Sekcie sa účastníkovi zobrazujú v zadanom poradí.
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
          v-for="(section, sIdx) in activeSections"
          :key="section.uuid"
          class="border border-default"
          :ui="{ body: 'space-y-4 p-4 sm:p-5' }">
          <!-- Section Header with Reorder and Delete controls -->
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2 flex-1">
              <span class="text-xs font-semibold text-muted shrink-0 w-6">
                #{{ sIdx + 1 }}
              </span>
              <UIcon name="i-ph-folder" class="text-primary text-xl shrink-0" />
              <UInput
                v-model="section.title"
                placeholder="Názov sekcie"
                class="font-semibold flex-1 max-w-sm" />
            </div>
            <div class="flex items-center gap-1 self-end sm:self-auto">
              <!-- Reorder buttons for sections -->
              <UButton
                icon="i-ph-arrow-up"
                size="xs"
                variant="ghost"
                color="neutral"
                :disabled="sIdx === 0"
                title="Posunúť sekciu vyššie"
                @click="moveSection(section.uuid, 'up')" />
              <UButton
                icon="i-ph-arrow-down"
                size="xs"
                variant="ghost"
                color="neutral"
                :disabled="sIdx === activeSections.length - 1"
                title="Posunúť sekciu nižšie"
                @click="moveSection(section.uuid, 'down')" />
              <USeparator orientation="vertical" class="h-4 mx-1" />
              <UButton
                icon="i-ph-trash-simple"
                variant="ghost"
                color="error"
                size="xs"
                title="Zmazať sekciu"
                :disabled="activeSections.length <= 1"
                @click="removeSection(section.uuid)" />
            </div>
          </div>

          <!-- Questions inside this section -->
          <div class="space-y-3 pl-4 border-l-2 border-muted">
            <div
              v-for="(q, qIdx) in section.questions.filter(
                (item: RegistrationQuestion) => !item.deleted,
              )"
              :key="q.uuid"
              class="flex flex-col gap-2 p-3 rounded-lg bg-muted/40 border border-default/30">
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <!-- Question Reorder Controls -->
                <div class="flex items-center gap-0.5 shrink-0">
                  <UButton
                    icon="i-ph-arrow-up"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :disabled="qIdx === 0"
                    title="Posunúť otázku vyššie"
                    @click="moveQuestion(section.uuid, q.uuid, 'up')" />
                  <UButton
                    icon="i-ph-arrow-down"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :disabled="
                      qIdx ===
                      section.questions.filter((i) => !i.deleted).length - 1
                    "
                    title="Posunúť otázku nižšie"
                    @click="moveQuestion(section.uuid, q.uuid, 'down')" />
                </div>

                <UInput
                  v-model="q.title"
                  placeholder="Znenie otázky"
                  class="flex-1 w-full" />
                <USelect
                  :model-value="q.type"
                  :items="questionTypeOptions"
                  class="w-full sm:w-56"
                  @update:model-value="
                    (val) => onQuestionTypeChange(q, val as string)
                  " />
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

              <!-- Question Description / Hint -->
              <UInput
                v-model="q.description"
                placeholder="Nápoveda / vysvetlenie k otázke (nepovinné)"
                size="xs"
                variant="subtle"
                class="w-full text-xs text-muted" />

              <!-- Options for 'select' and 'multiselect' -->
              <div
                v-if="isChoiceQuestion(q)"
                class="mt-2 pl-4 sm:pl-6 border-l-2 border-primary/30 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-muted">
                    Možnosti výberu:
                  </span>
                  <UButton
                    icon="i-ph-plus"
                    label="Pridať možnosť"
                    size="xs"
                    variant="ghost"
                    color="primary"
                    @click="addQuestionOption(q)" />
                </div>

                <div
                  v-for="(opt, optIdx) in q.options"
                  :key="optIdx"
                  class="flex items-center gap-1.5">
                  <UButton
                    icon="i-ph-arrow-up"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :disabled="optIdx === 0"
                    @click="moveQuestionOption(q, optIdx, 'up')" />
                  <UButton
                    icon="i-ph-arrow-down"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :disabled="optIdx === q.options.length - 1"
                    @click="moveQuestionOption(q, optIdx, 'down')" />
                  <UInput
                    :model-value="opt"
                    placeholder="Zadajte názov možnosti"
                    class="flex-1"
                    size="xs"
                    @update:model-value="
                      (val) => updateQuestionOption(q, optIdx, val as string)
                    " />
                  <UButton
                    icon="i-ph-trash-simple"
                    size="xs"
                    color="error"
                    variant="ghost"
                    :disabled="q.options.length <= 1"
                    @click="removeQuestionOption(q, optIdx)" />
                </div>
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

          <!-- Section visibility conditions (visibleWhen) -->
          <div class="mt-4 pt-3 border-t border-muted/30 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-ph-git-branch" class="text-primary text-base" />
                <span class="text-xs font-semibold">
                  Podmienky zobrazenia sekcie
                </span>
                <UBadge
                  v-if="section.visibleWhen && section.visibleWhen.length > 0"
                  size="xs"
                  color="primary"
                  variant="subtle">
                  {{ section.visibleWhen.length }}
                </UBadge>
              </div>
              <UButton
                icon="i-ph-plus"
                label="Pridať podmienku"
                size="xs"
                variant="soft"
                color="neutral"
                @click="addSectionRule(section)" />
            </div>

            <p
              v-if="!section.visibleWhen || section.visibleWhen.length === 0"
              class="text-xs text-muted italic">
              Sekcia sa zobrazí vždy (žiadne podmienky zobrazenia).
            </p>

            <div v-else class="space-y-2">
              <div
                v-for="(rule, rIdx) in section.visibleWhen"
                :key="rIdx"
                class="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-default/40">
                <span class="text-xs font-medium text-muted shrink-0">
                  Zobraziť, ak:
                </span>

                <!-- Source selector: Role or Question -->
                <USelect
                  :model-value="rule.questionUuid"
                  :items="getConditionSourcesForSection(section.uuid)"
                  class="w-full sm:w-60"
                  size="xs"
                  @update:model-value="
                    (val) => onRuleSourceChange(rule, val as string)
                  " />

                <!-- Operator selector -->
                <USelect
                  :model-value="rule.operator"
                  :items="getOperatorOptions(rule.questionUuid)"
                  class="w-full sm:w-36"
                  size="xs"
                  @update:model-value="
                    (val) => onRuleOperatorChange(rule, val as any)
                  " />

                <!-- Value component based on target -->
                <div class="w-full sm:w-auto flex-1">
                  <!-- Case 1: Role -->
                  <template
                    v-if="rule.questionUuid === ROLE_CONDITION_QUESTION_UUID">
                    <!-- Single selection: equals / not_equals -->
                    <USelect
                      v-if="
                        rule.operator === 'equals' ||
                        rule.operator === 'not_equals'
                      "
                      :model-value="(rule as any).value"
                      :items="roleConditionOptions"
                      class="w-full"
                      size="xs"
                      @update:model-value="
                        (val) => ((rule as any).value = val)
                      " />

                    <!-- Multi selection: in / not_in as clickable badge pills -->
                    <div
                      v-else
                      class="flex flex-wrap gap-1.5 items-center py-0.5">
                      <UBadge
                        v-for="rItem in activeRoles"
                        :key="rItem.uuid"
                        :color="
                          isRoleSelected(rule, rItem.uuid)
                            ? 'primary'
                            : 'neutral'
                        "
                        :variant="
                          isRoleSelected(rule, rItem.uuid) ? 'solid' : 'subtle'
                        "
                        class="cursor-pointer select-none transition-colors px-2 py-1 text-xs"
                        @click="toggleRoleInRule(rule, rItem.uuid)">
                        <UIcon
                          :name="
                            isRoleSelected(rule, rItem.uuid)
                              ? 'i-ph-check-bold'
                              : 'i-ph-plus'
                          "
                          class="size-3 mr-1 inline-block" />
                        {{ rItem.name || "Bez názvu" }}
                      </UBadge>
                    </div>
                  </template>

                  <!-- Case 2: Question -->
                  <template v-else>
                    <!-- Boolean question -->
                    <template
                      v-if="
                        findQuestion(rule.questionUuid)?.type === 'boolean'
                      ">
                      <USelect
                        :model-value="
                          (rule as any).value === false ? 'false' : 'true'
                        "
                        :items="booleanConditionOptions"
                        class="w-full"
                        size="xs"
                        @update:model-value="
                          (val) => ((rule as any).value = val === 'true')
                        " />
                    </template>

                    <!-- Select or Multiselect question -->
                    <template
                      v-else-if="
                        findQuestion(rule.questionUuid)?.type === 'select' ||
                        findQuestion(rule.questionUuid)?.type === 'multiselect'
                      ">
                      <!-- Single selection: equals / not_equals -->
                      <USelect
                        v-if="
                          rule.operator === 'equals' ||
                          rule.operator === 'not_equals'
                        "
                        :model-value="(rule as any).value"
                        :items="getQuestionSelectOptions(rule.questionUuid)"
                        class="w-full"
                        size="xs"
                        @update:model-value="
                          (val) => ((rule as any).value = val)
                        " />

                      <!-- Multi selection: in / not_in as clickable badge pills -->
                      <div
                        v-else
                        class="flex flex-wrap gap-1.5 items-center py-0.5">
                        <UBadge
                          v-for="opt in getQuestionOptionsList(
                            rule.questionUuid,
                          )"
                          :key="opt"
                          :color="
                            isOptionSelected(rule, opt) ? 'primary' : 'neutral'
                          "
                          :variant="
                            isOptionSelected(rule, opt) ? 'solid' : 'subtle'
                          "
                          class="cursor-pointer select-none transition-colors px-2 py-1 text-xs"
                          @click="toggleOptionInRule(rule, opt)">
                          <UIcon
                            :name="
                              isOptionSelected(rule, opt)
                                ? 'i-ph-check-bold'
                                : 'i-ph-plus'
                            "
                            class="size-3 mr-1 inline-block" />
                          {{ opt }}
                        </UBadge>
                      </div>
                    </template>

                    <!-- Number question -->
                    <template
                      v-else-if="
                        findQuestion(rule.questionUuid)?.type === 'number'
                      ">
                      <UInputNumber
                        v-if="
                          rule.operator === 'equals' ||
                          rule.operator === 'not_equals'
                        "
                        :model-value="
                          typeof (rule as any).value === 'number'
                            ? (rule as any).value
                            : 0
                        "
                        class="w-full"
                        size="xs"
                        @update:model-value="
                          (val) => ((rule as any).value = Number(val))
                        " />
                      <UInputTags
                        v-else
                        :model-value="getArrayRuleValue(rule)"
                        placeholder="Zadajte čísla a stlačte Enter..."
                        class="w-full sm:min-w-48"
                        size="xs"
                        @update:model-value="
                          (val) =>
                            ((rule as any).value = val.map((v) => Number(v)))
                        " />
                    </template>

                    <!-- Date question -->
                    <template
                      v-else-if="
                        findQuestion(rule.questionUuid)?.type === 'date'
                      ">
                      <UInput
                        v-if="
                          rule.operator === 'equals' ||
                          rule.operator === 'not_equals'
                        "
                        type="date"
                        :model-value="String(rule.value ?? '')"
                        class="w-full"
                        size="xs"
                        @update:model-value="
                          (val) => ((rule as any).value = val)
                        " />
                      <UInputTags
                        v-else
                        :model-value="getArrayRuleValue(rule)"
                        placeholder="Zadajte dátumy a stlačte Enter..."
                        class="w-full sm:min-w-48"
                        size="xs"
                        @update:model-value="
                          (val) => setArrayRuleValue(rule, val)
                        " />
                    </template>

                    <!-- Text / generic question -->
                    <template v-else>
                      <UInput
                        v-if="
                          rule.operator === 'equals' ||
                          rule.operator === 'not_equals'
                        "
                        :model-value="String(rule.value ?? '')"
                        placeholder="Hodnota"
                        class="w-full"
                        size="xs"
                        @update:model-value="
                          (val) => ((rule as any).value = val)
                        " />
                      <UInputTags
                        v-else
                        :model-value="getArrayRuleValue(rule)"
                        placeholder="Zadajte hodnoty a stlačte Enter..."
                        class="w-full sm:min-w-48"
                        size="xs"
                        @update:model-value="
                          (val) => setArrayRuleValue(rule, val)
                        " />
                    </template>
                  </template>
                </div>

                <!-- Delete rule -->
                <UButton
                  icon="i-ph-x"
                  size="xs"
                  color="error"
                  variant="ghost"
                  class="sm:ml-auto"
                  @click="removeSectionRule(section, rIdx)" />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
