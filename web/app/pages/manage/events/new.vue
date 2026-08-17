<script setup lang="ts">
import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import type { TabsItem } from "@nuxt/ui";
import z from "zod";
import { leagueEnum, regionEnum } from "~~/server/db/schema/clubs";

const items = computed<TabsItem[]>(() => [
  {
    label: "Základné informácie",
    icon: "i-ph-sliders",
    value: "basic",
  },
  { label: "Organizátori/-ky", icon: "i-ph-users-three", value: "organizers" },
  {
    label: "Detaily registrácie",
    icon: "i-ph-ticket",
    value: "registration-details",
  },
  {
    label: "Registračný formulár",
    icon: "i-ph-text-align-left",
    value: "registration-form",
    disabled: true,
  },
]);

const detailsSchema = z.object({
  slug: z
    .string("ID podujatia je povinný údaj.")
    .min(1, "ID podujatia je povinný údaj."),
  name: z
    .string("Názov podujatia je povinný údaj.")
    .min(1, "Názov podujatia je povinný údaj."),
  type: z.enum(
    ["tournament", "workshop", "other"],
    "Prosím, vyberte typ podujatia.",
  ),
  place: z
    .string("Miesto konania je povinný údaj.")
    .min(1, "Miesto konania je povinný údaj."),
  address: z
    .string("Adresa konania je povinný údaj")
    .min(1, "Adresa konania je povinný údaj"),
  beginning: z
    .any()
    .refine(
      (value) => value instanceof CalendarDate,
      "Dátum začiatku musí byť platný dátum.",
    ),
  targetLeague: z
    .enum(leagueEnum.enumValues, "Prosím, vyberte platný debatný program.")
    .optional(),
  targetRegion: z
    .enum(regionEnum.enumValues, "Prosím, vyberte platný región.")
    .optional()
    .nullable(),
  deadline: z
    .any()
    .refine(
      (value) => value instanceof CalendarDateTime,
      "Deadline musí byť platný dátum a čas.",
    ),
});

type DetailsSchema = z.output<typeof detailsSchema>;

const details = reactive<Partial<DetailsSchema>>({
  slug: undefined,
  name: undefined,
  type: undefined,
  place: undefined,
  address: undefined,
  beginning: undefined,
  targetLeague: undefined,
  targetRegion: undefined,
  deadline: undefined,
});

const activeTab = ref("basic");
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="home">
      <template #header>
        <UDashboardNavbar title="Tvorba podujatia" :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
        <UDashboardToolbar>
          <UTabs v-model="activeTab" :items="items" :content="false" />
          <UButton
            label="Vytvoriť podujatie"
            color="primary"
            variant="solid"
            icon="i-ph-checks" />
        </UDashboardToolbar>
      </template>
      <template #body>
        <!-- Render content based on activeTab -->
        <div v-if="activeTab === 'basic'">
          <UPageHeader title="Základné informácie" class="mb-4" />
          <UForm
            :schema="detailsSchema"
            :state="details"
            class="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
            <UFormField
              label="Náhľadová snímka podujatia"
              :ui="{ container: 'h-full' }"
              class="row-span-3 h-full">
              <UCard
                class="aspect-21/9 flex"
                :ui="{
                  body: 'flex h-full w-full p-0 sm:p-0 items-center justify-center',
                }">
                <UButton
                  label="Vybrať súbor"
                  size="lg"
                  variant="subtle"
                  color="neutral"
                  trailing-icon="i-ph-upload" />
              </UCard>
            </UFormField>
            <UFormField
              label="Unikátne ID podujatia"
              name="slug"
              hint="nemožno neskôr zmeniť"
              required>
              <UInput
                v-model="details.slug"
                placeholder="Zadajte unikátne ID podujatia (napr. SZ271)" />
            </UFormField>
            <UFormField label="Typ podujatia" name="type" required>
              <USelect
                v-model="details.type"
                placeholder="Vyberte typ podujatia"
                class="w-full"
                :items="[
                  {
                    label: 'Turnaj',
                    value: 'tournament',
                  },
                  {
                    label: 'Seminár',
                    value: 'workshop',
                  },
                  {
                    label: 'Iný typ podujatia',
                    value: 'other',
                  },
                ]" />
            </UFormField>

            <UFormField label="Názov podujatia" name="name" required>
              <UInput
                v-model="details.name"
                placeholder="Zadajte oficiálny názov podujatia" />
            </UFormField>

            <UFormField label="Miesto konania podujaia" name="place" required>
              <UInput
                v-model="details.place"
                placeholder="Zadajte miesto podujatia (napr. Košice)" />
            </UFormField>
            <UFormField label="Adresa konania podujaia" name="address" required>
              <UInput
                v-model="details.address"
                placeholder="Zadajte adresu podujatia" />
            </UFormField>
            <UFormField
              label="Počiatočný dátum podujatia"
              name="beginning"
              required>
              <UInputDate
                v-model="details.beginning as CalendarDate | null"
                class="w-full" />
            </UFormField>
            <template v-if="details.type === 'tournament'">
              <UFormField label="Debatný program" name="lague" required>
                <USelect
                  v-model="details.targetLeague"
                  placeholder="Vyberte debatný program"
                  class="w-full"
                  :items="[
                    {
                      label: 'Základoškolský debatný program',
                      value: 'junior',
                    },
                    {
                      label: 'Stredoškolský debatný program',
                      value: 'senior',
                    },
                    {
                      label: 'Vysokoškolský debatný program',
                      value: 'university',
                    },
                  ]" />
              </UFormField>
              <UFormField label="Cieľový región" name="targetRegion" required>
                <USelect
                  v-model="details.targetRegion"
                  placeholder="Vyberte cieľový región"
                  class="w-full"
                  :items="[
                    {
                      label: 'Západoslovenský región',
                      value: 'western',
                    },
                    {
                      label: 'Stredoslovenský región',
                      value: 'central',
                    },
                    {
                      label: 'Východoslovenský región',
                      value: 'eastern',
                    },
                    {
                      label: 'Celoslovenské podujatie',
                      value: null,
                    },
                  ]" />
              </UFormField>
            </template>
            <UFormField label="Soft deadline" name="deadline" required>
              <UInputDate
                v-model="details.deadline as CalendarDateTime | null"
                granularity="minute"
                class="w-full" />
            </UFormField>
          </UForm>
        </div>
        <div v-else-if="activeTab === 'organizers'">
          <UPageHeader title="Organizátori/-ky" class="mb-4" />
        </div>
        <div v-else-if="activeTab === 'registration-details'">
          <UPageHeader title="Detaily registrácie" class="mb-4" />
        </div>
        <div v-else-if="activeTab === 'registration-form'">
          <UPageHeader title="Registračný formulár" class="mb-4" />
        </div>
      </template>
    </UDashboardPanel>
  </div>
  x
</template>
