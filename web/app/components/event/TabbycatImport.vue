<script setup lang="ts">
import type { ImportPreview, ImportTournament } from "#shared/types/tabbycat";

const props = defineProps<{ slug: string }>();
const open = defineModel<boolean>("open", { default: false });
const server = ref("https://tabbycat.sda.sk");
const token = ref("");
const tournaments = ref<ImportTournament[]>([]);
const tournament = ref("");
const previewData = ref<ImportPreview | null>(null);
const busy = ref(false);
const importing = ref(false);
const error = ref("");
const mixedAcknowledged = ref(false);
const completed = ref<number | null>(null);
const progress = ref(0);
onBeforeUnmount(() => {
  token.value = "";
});
const endpoint = computed(
  () => `/api/events/${encodeURIComponent(props.slug)}/registrations/tabbycat`,
);
const finished = computed(() => completed.value !== null);
const creates = computed(
  () =>
    previewData.value?.plan.operations.filter((item) => item.method === "POST")
      .length ?? 0,
);
const updates = computed(
  () =>
    previewData.value?.plan.operations.filter((item) => item.method === "PATCH")
      .length ?? 0,
);
const labels = {
  institution: "Inštitúcia",
  team: "Tím",
  speaker: "Rečník/čka",
  adjudicator: "Rozhodca/kyňa",
};
const countLabels = {
  registrations: "Registrácie",
  teams: "Tímy",
  speakers: "Rečníci/čky",
  adjudicators: "Rozhodcovia/kyne",
};

const requestBody = () => ({ server: server.value, token: token.value });
function message(cause: unknown): string {
  const response = cause as {
    data?: { message?: string; data?: { message?: string } };
  };
  return (
    response.data?.data?.message ||
    response.data?.message ||
    "Požiadavku sa nepodarilo dokončiť. Skontrolujte pripojenie a skúste znova."
  );
}

watch([server, token], () => {
  if (!previewData.value) {
    tournaments.value = [];
    tournament.value = "";
  }
});

async function request(action: () => Promise<void>, isImport = false) {
  if (busy.value) return;
  busy.value = true;
  importing.value = isImport;
  error.value = "";
  try {
    await action();
  } catch (cause) {
    error.value = message(cause);
    // A lost response can follow a successful write; always rebuild the preview.
    if (isImport) previewData.value = null;
  } finally {
    busy.value = importing.value = false;
  }
}

function connect() {
  return request(async () => {
    const result = await $fetch<{
      origin: string;
      tournaments: ImportTournament[];
    }>(`${endpoint.value}/connection`, { method: "POST", body: requestBody() });
    server.value = result.origin;
    await nextTick();
    tournaments.value = result.tournaments;
    if (!result.tournaments.length)
      error.value = "Server nevrátil žiadne dostupné turnaje.";
  });
}

function preview() {
  return request(async () => {
    mixedAcknowledged.value = false;
    previewData.value = await $fetch<ImportPreview>(
      `${endpoint.value}/preview`,
      {
        method: "POST",
        body: { ...requestBody(), tournament: tournament.value },
      },
    );
  });
}

function execute() {
  const initial = previewData.value;
  if (!initial) return;
  return request(async () => {
    let fingerprint = initial.fingerprint;
    let remaining = initial.plan.operations.length;
    progress.value = 0;
    while (remaining > 0) {
      const result = await $fetch<{
        completed: number;
        remaining: number;
        fingerprint: string;
      }>(`${endpoint.value}/import`, {
        method: "POST",
        body: {
          ...requestBody(),
          tournament: tournament.value,
          fingerprint,
          acknowledgeMixedTeams: mixedAcknowledged.value,
        },
      });
      progress.value += result.completed;
      remaining = result.remaining;
      fingerprint = result.fingerprint;
    }
    completed.value = progress.value;
  }, true);
}

function reset() {
  previewData.value = null;
  completed.value = null;
  mixedAcknowledged.value = false;
  error.value = "";
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Importovať do Tabbycatu"
    description="Pripojte server, vyberte turnaj a skontrolujte zmeny pred importom."
    :dismissible="!busy"
    :close="busy ? false : undefined"
    :ui="{ content: 'max-w-4xl', footer: 'flex-wrap justify-end' }">
    <template #body>
      <div class="space-y-5">
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          title="Import sa nepodarilo dokončiť"
          :description="error" />
        <div v-if="!finished" class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Adresa Tabbycatu">
            <UInput
              v-model="server"
              type="url"
              placeholder="https://tabbycat.sda.sk"
              :disabled="busy || !!previewData"
              class="w-full" />
          </UFormField>
          <UFormField
            label="API token"
            help="Token nájdete v Tabbycate pri zmene hesla. Neukladáme ho.">
            <UInput
              v-model="token"
              type="password"
              autocomplete="off"
              :disabled="busy"
              class="w-full" />
          </UFormField>
        </div>

        <template v-if="!previewData">
          <UButton
            v-if="!tournaments.length"
            label="Pripojiť server"
            icon="i-ph-plugs-connected"
            :loading="busy"
            :disabled="!server.trim() || !token.trim()"
            @click="connect" />
          <UFormField v-else label="Cieľový turnaj">
            <USelectMenu
              v-model="tournament"
              :items="
                tournaments.map((item) => ({
                  label: item.name,
                  value: item.slug,
                }))
              "
              value-key="value"
              placeholder="Vyberte turnaj"
              :disabled="busy"
              class="w-full" />
          </UFormField>
        </template>

        <template v-else>
          <div class="space-y-1">
            <p class="font-semibold text-highlighted">
              {{ previewData.tournamentName }}
            </p>
            <p class="text-sm text-muted break-all">
              {{ previewData.origin }} · {{ previewData.tournament }}
            </p>
          </div>
          <UAlert
            v-if="finished"
            color="success"
            variant="subtle"
            title="Import bol dokončený"
            :description="`Úspešne vykonaných zmien: ${completed}.`" />
          <UAlert
            v-else-if="
              !previewData.plan.errors.length &&
              !previewData.plan.operations.length
            "
            color="success"
            variant="subtle"
            title="Všetko je aktuálne"
            description="Údaje z náhľadu už sú v Tabbycate. Nie je čo importovať." />
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="(label, key) in countLabels"
              :key="key"
              variant="subtle">
              {{ label }}: {{ previewData.plan.counts[key] }}
            </UBadge>
          </div>
          <p class="text-sm text-muted">
            Nové: {{ creates }} · Úpravy: {{ updates }} · Bez zmeny:
            {{ previewData.plan.counts.unchanged }}
          </p>

          <UAlert
            v-for="issue in previewData.plan.errors"
            :key="issue"
            color="error"
            variant="subtle"
            :title="issue" />
          <div v-if="previewData.plan.excluded.length" class="text-sm">
            <p class="font-medium">Vynechané registrácie:</p>
            <p v-for="item in previewData.plan.excluded" :key="item.role">
              {{ item.role }}: {{ item.count }}
            </p>
          </div>
          <details v-if="previewData.plan.warnings.length" class="text-sm">
            <summary class="cursor-pointer font-medium">
              Upozornenia ({{ previewData.plan.warnings.length }})
            </summary>
            <ul class="mt-2 space-y-1 list-disc pl-5">
              <li v-for="warning in previewData.plan.warnings" :key="warning">
                {{ warning }}
              </li>
            </ul>
          </details>
          <div v-if="previewData.plan.mixedTeams.length" class="space-y-3">
            <UAlert
              color="warning"
              variant="subtle"
              :title="`Tímy z viacerých klubov (${previewData.plan.mixedTeams.length})`"
              description="Overte členov tímov. Tieto tímy budú bez hlavnej inštitúcie a s konfliktmi voči všetkým zastúpeným klubom." />
            <EventTabbycatMixedTeams
              :key="previewData.fingerprint"
              :teams="previewData.plan.mixedTeams" />
            <UCheckbox
              v-if="!finished && previewData.plan.operations.length"
              v-model="mixedAcknowledged"
              label="Skontroloval/a som členov zmiešaných tímov."
              :disabled="importing" />
          </div>

          <ul
            v-if="previewData.plan.operations.length"
            aria-label="Náhľad zmien v Tabbycate"
            class="max-h-80 overflow-y-auto divide-y divide-default rounded-lg border border-default">
            <li
              v-for="operation in previewData.plan.operations"
              :key="operation.key"
              class="flex items-start justify-between gap-4 p-3 text-sm">
              <div class="min-w-0">
                <p class="font-medium break-words">{{ operation.label }}</p>
                <p class="text-muted">{{ labels[operation.entity] }}</p>
              </div>
              <UBadge color="neutral" variant="subtle" class="shrink-0">
                {{ operation.method === "POST" ? "Vytvoriť" : "Upraviť" }}
              </UBadge>
            </li>
          </ul>
          <UProgress
            v-if="importing"
            :model-value="progress"
            :max="previewData.plan.operations.length"
            aria-label="Prebieha import do Tabbycatu" />
        </template>
      </div>
    </template>
    <template #footer>
      <UButton
        v-if="!busy"
        label="Zavrieť"
        color="neutral"
        variant="outline"
        @click="open = false" />
      <UButton
        v-if="previewData && !importing"
        label="Nový import"
        color="neutral"
        variant="subtle"
        :loading="busy"
        @click="reset" />
      <UButton
        v-if="!previewData && tournaments.length"
        label="Zobraziť náhľad"
        :loading="busy"
        :disabled="!tournament || !token.trim()"
        @click="preview" />
      <UButton
        v-if="previewData && !finished && previewData.plan.operations.length"
        label="Importovať do turnaja"
        icon="i-ph-arrow-square-out"
        :loading="importing"
        :disabled="
          busy ||
          !token.trim() ||
          !!previewData.plan.errors.length ||
          (!!previewData.plan.mixedTeams.length && !mixedAcknowledged)
        "
        @click="execute" />
    </template>
  </UModal>
</template>
