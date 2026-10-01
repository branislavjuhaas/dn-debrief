<script setup lang="ts">
import type { Event } from "#shared/types/event";
import {
  isPlatformRegistration,
  isExternalRegistration,
  type ExternalRegistrationConfig,
  type PlatformRegistrationConfig,
} from "#shared/utils/events";

const model = defineModel<Partial<Event>>({
  default: () => ({}),
});

const externalRef = useTemplateRef("externalRef");
const platformRef = useTemplateRef("platformRef");

// Determine registration mode (external vs platform)
const activeMode = ref<"external" | "platform">(
  isPlatformRegistration(model.value?.registrationConfig)
    ? "platform"
    : "external",
);

// Switch mode and safely transition data structure
const setMode = (mode: "external" | "platform") => {
  activeMode.value = mode;

  const current = model.value.registrationConfig;

  if (mode === "platform") {
    if (!isPlatformRegistration(current)) {
      const defaultSectionUuid = crypto.randomUUID();
      const existingCost = (current as any)?.cost ?? 0;
      const existingReqMembership = (current as any)?.requireMembership ?? true;

      model.value.registrationConfig = {
        roles: [
          {
            uuid: crypto.randomUUID(),
            name: "Debatér/-ka",
            cost: existingCost,
            roleType: "contestant",
            credentialRequirements: "none",
          },
          {
            uuid: crypto.randomUUID(),
            name: "Rozhodca/-kyňa",
            cost: existingCost,
            roleType: "adjudicator",
            credentialRequirements: "adjudicator",
          },
        ],
        requireAccount: true,
        requireMembership: existingReqMembership,
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
    }
  } else {
    if (!isExternalRegistration(current)) {
      const existingRoleCost = (current as any)?.roles?.[0]?.cost ?? 0;
      const existingReqMembership = (current as any)?.requireMembership ?? true;

      model.value.registrationConfig = {
        deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
        href: "",
        cost: existingRoleCost,
        requireMembership: existingReqMembership,
      };
    }
  }
};

const validate = async () => {
  if (activeMode.value === "external") {
    return (await externalRef.value?.validate()) ?? false;
  } else {
    return (await platformRef.value?.validate()) ?? false;
  }
};

defineExpose({
  validate,
});

const modeTabs = [
  {
    label: "Externý zber",
    icon: "i-ph-arrow-square-up-right",
    value: "external",
  },
  {
    label: "Zber v DebRIEF-e",
    icon: "i-ph-sun-horizon",
    value: "platform",
  },
];
</script>

<template>
  <div class="flex flex-col w-full gap-6">
    <UPageCard
      orientation="horizontal"
      description="Platforma DebRIEF teraz ponúka možnosť registrácie na podujatia priamo v systéme s možnosťou platieb za registráciu, úpravy údajov a ich exportu.">
      <template #title>
        Zbierať registrácie priamo v DebRIEF-e?
        <UBadge size="lg" variant="subtle" color="warning" class="-mt-3 ml-2">
          Experimentálne
        </UBadge>
      </template>
      <template #footer>
        <UTabs
          :items="modeTabs"
          :model-value="activeMode"
          :content="false"
          @update:model-value="
            (val) => setMode(val as 'external' | 'platform')
          " />
      </template>
      <div
        class="flex h-full w-full lg:min-h-36 overflow-hidden relative rounded-lg max-lg:hidden opacity-60">
        <NuxtImg
          src="/assets/registrations-banner.jpg"
          class="absolute w-full ml-auto object-cover object-top" />
      </div>
    </UPageCard>

    <div v-if="activeMode === 'external'" class="pt-2">
      <EventRegistrationExternal
        ref="externalRef"
        v-model="model.registrationConfig as ExternalRegistrationConfig" />
    </div>

    <div v-else class="pt-2">
      <EventRegistrationPlatform
        ref="platformRef"
        v-model="model.registrationConfig as PlatformRegistrationConfig" />
    </div>
  </div>
</template>
