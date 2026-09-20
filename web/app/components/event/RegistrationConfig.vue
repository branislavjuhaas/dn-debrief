<script setup lang="ts">
import { z } from "zod";
import {
  CalendarDateTime,
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
});

// Writable computed property for Deadline
const deadline = computed<CalendarDateTime>({
  get: () => {
    const raw = model.value.registrationConfig?.deadline;
    const isoString = raw ?? new Date().toISOString();
    return toCalendarDateTime(parseAbsoluteToLocal(isoString));
  },
  set: (val: CalendarDateTime) => {
    model.value.registrationConfig = {
      ...model.value.registrationConfig,
      deadline: val.toString(), // converts CalendarDateTime to ISO string
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
      <UFormField name="href" label="Registračný formulár">
        <UInput
          v-model="href"
          type="url"
          placeholder="https://forms.ju.dev/YgmJX2MSeJqw2w8K9" />
      </UFormField>

      <UFormField name="deadline" label="Deadline">
        <UInputDate v-model="deadline" granularity="minute" class="w-full" />
      </UFormField>
    </UForm>
  </div>
</template>
