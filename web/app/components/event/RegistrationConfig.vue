<script setup lang="ts">
import { z } from "zod";
import {
  CalendarDateTime,
  getLocalTimeZone,
  parseAbsoluteToLocal,
  toCalendarDateTime,
} from "@internationalized/date";

import type { Event } from "#shared/types/event";

const model = defineModel<Partial<Event>>({
  default: () => ({}),
});

const collectRegistrations = ref(false);

const externalForm = useTemplateRef("externalForm");

const validate = async () => {
  if (!externalForm.value) return false;

  const externalResult = await externalForm.value.validate({ silent: true });
  return externalResult;
};

defineExpose({
  validate,
});

const externalConfigSchema = z.object({
  deadline: z
    .any()
    .refine(
      (value) => value instanceof CalendarDateTime,
      "Dátum je povinný údaj",
    ),
  href: z.url("Link na registračný formulár musí byť platný URL"),
  cost: z
    .number("Cena podujatia je povinný údaj")
    .min(0, "Cena podujatia musí byť nezáporná hodnota"),
  requireMembership: z.boolean(),
});

// Writable computed property for Deadline
const deadline = computed<CalendarDateTime>({
  get: () => {
    const raw = model.value.registrationConfig?.deadline;
    if (!raw) {
      return toCalendarDateTime(parseAbsoluteToLocal(new Date().toISOString()));
    }
    try {
      const iso =
        raw.endsWith("Z") || raw.includes("+")
          ? raw
          : new Date(raw).toISOString();
      return toCalendarDateTime(parseAbsoluteToLocal(iso));
    } catch {
      return toCalendarDateTime(parseAbsoluteToLocal(new Date().toISOString()));
    }
  },
  set: (val: CalendarDateTime) => {
    if (!val) return;

    const jsDate = val.toDate(getLocalTimeZone());

    model.value.registrationConfig = {
      ...model.value.registrationConfig,
      deadline: jsDate.toISOString(),
    };
  },
});

// Writable computed property for Href
const href = computed<string>({
  get: () => model.value.registrationConfig?.href ?? "",
  set: (val: string) => {
    model.value.registrationConfig = {
      ...model.value.registrationConfig,
      href: val,
    };
  },
});

// Combined object for UForm validation state
const formState = computed(() => ({
  deadline: deadline.value,
  href: href.value,
  cost: model.value.registrationConfig.cost,
  requireMembership: model.value.registrationConfig.requireMembership,
}));
</script>

<template>
  <div class="flex flex-col w-full gap-4">
    <UPageCard
      orientation="horizontal"
      description="Platforma DebRIEF teraz ponúka možnosť registrácie na podujatia priamo v systéme s možnosťou platieb za registráciu, úpravy údajov a ich exportu.">
      <template #title>
        Zbierať registrácie priamo v DebRIEF-e?
        <UBadge size="lg" variant="subtle" color="error" class="-mt-3 ml-2">
          Neimplementované
        </UBadge>
      </template>
      <template #footer>
        <USwitch
          v-model="collectRegistrations"
          label="Centrálny zber registrácií"
          disabled />
      </template>
      <div
        class="flex h-full w-full lg:min-h-36 overflow-hidden relative rounded-lg max-lg:hidden opacity-60">
        <NuxtImg
          src="/assets/registrations-banner.jpg"
          class="absolute w-full ml-auto object-cover object-top" />
      </div>
    </UPageCard>

    <UForm
      ref="externalForm"
      :schema="externalConfigSchema"
      :state="formState"
      class="space-y-4">
      <UFormField
        name="href"
        label="Registračný formulár"
        orientation="horizontal">
        <UInput
          v-model="href"
          type="url"
          placeholder="https://forms.ju.dev/YgmJX2MSeJqw2w8K9"
          class="lg:min-w-200" />
      </UFormField>

      <UFormField name="deadline" label="Deadline" orientation="horizontal">
        <UInputDate v-model="deadline" granularity="minute" class="w-full" />
      </UFormField>

      <UFormField
        name="cost"
        label="Registračný poplatok"
        hint="(v mene EUR)"
        orientation="horizontal">
        <UInputNumber v-model="model.registrationConfig.cost" class="w-full" />
      </UFormField>

      <UFormField
        name="cost"
        label="Vyžadovať v členstvo v SDA"
        orientation="horizontal">
        <USwitch v-model="model.registrationConfig.requireMembership" />
      </UFormField>
    </UForm>
  </div>
</template>
