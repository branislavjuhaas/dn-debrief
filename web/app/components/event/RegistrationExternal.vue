<script setup lang="ts">
import { z } from "zod";
import {
  CalendarDateTime,
  getLocalTimeZone,
  parseAbsoluteToLocal,
  toCalendarDateTime,
} from "@internationalized/date";
import type { ExternalRegistrationConfig } from "#shared/utils/events";

const model = defineModel<ExternalRegistrationConfig>({
  default: () => ({
    deadline: new Date().toISOString(),
    href: "",
    cost: 0,
    requireMembership: true,
  }),
});

const formRef = useTemplateRef("formRef");

const validate = async () => {
  if (!formRef.value) return false;
  return await formRef.value.validate({ silent: true });
};

defineExpose({
  validate,
});

const schema = z.object({
  deadline: z
    .any()
    .refine(
      (val) => val instanceof CalendarDateTime,
      "Dátum uzávierky je povinný údaj",
    ),
  href: z
    .string("Odkaz je povinný údaj")
    .url("Link na registračný formulár musí byť platná URL adresa"),
  cost: z
    .number("Cena je povinný údaj")
    .min(0, "Cena musí byť nezáporná hodnota"),
  requireMembership: z.boolean(),
});

const deadline = computed<CalendarDateTime>({
  get: () => {
    const raw = model.value.deadline;
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
    model.value.deadline = jsDate.toISOString();
  },
});

const formState = computed(() => ({
  deadline: deadline.value,
  href: model.value.href,
  cost: model.value.cost,
  requireMembership: model.value.requireMembership,
}));
</script>

<template>
  <UForm ref="formRef" :schema="schema" :state="formState" class="space-y-4">
    <UFormField
      name="href"
      label="Registračný formulár"
      description="Odkaz na externý registračný formulár (napr. Google Formuláre, Typeform...)"
      orientation="horizontal"
      required>
      <UInput
        v-model="model.href"
        type="url"
        placeholder="https://forms.gle/..."
        class="w-full lg:max-w-xl font-mono text-sm" />
    </UFormField>

    <UFormField
      name="deadline"
      label="Uzávierka registrácie"
      description="Dátum a čas, po ktorom sa registrácia automaticky uzavrie"
      orientation="horizontal"
      required>
      <UInputDate
        v-model="deadline"
        granularity="minute"
        class="w-full lg:max-w-md" />
    </UFormField>

    <UFormField
      name="cost"
      label="Registračný poplatok"
      hint="(v EUR)"
      description="Základný účastnícky poplatok za osobu alebo tím"
      orientation="horizontal"
      required>
      <UInputNumber v-model="model.cost" :min="0" class="w-full lg:max-w-xs" />
    </UFormField>

    <UFormField
      name="requireMembership"
      label="Vyžadovať členstvo v SDA"
      description="Registrovať sa budú môcť len používatelia s potvrdeným členským v aktuálnej sezóne"
      orientation="horizontal">
      <USwitch v-model="model.requireMembership" />
    </UFormField>
  </UForm>
</template>
