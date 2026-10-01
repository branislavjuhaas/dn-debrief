<script setup lang="ts">
import { LazyModalConfirm } from "#components";
import type {
  Event,
  RegistrationQuestion,
  RegistrationRole,
} from "#shared/types/event";
import {
  isPlatformRegistration,
  normalizeTeamName,
} from "#shared/utils/events";
import { CalendarDate, parseDate } from "@internationalized/date";
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  layout: "manage",
  middleware: ["auth"],
  allowedRoles: [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ],
});

const route = useRoute();
const slug = route.params.slug as string;
const toast = useToast();
const overlay = useOverlay();

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");

// Fetch registrations and event
const { data, refresh, status } = await useFetch<{
  event: Event;
  registrations: any[];
}>(`/api/events/${slug}/registrations`, {
  key: `event-registrations-${slug}`,
});

const event = computed(() => data.value?.event);
const registrations = computed(() => data.value?.registrations ?? []);

useSeoMeta({
  title: computed(() => `Registrácie: ${event.value?.name ?? ""}`),
  description: "Správa účastníkov a tímových registrácií.",
});

// Roles mapping
const rolesList = computed<RegistrationRole[]>(() => {
  const cfg = event.value?.registrationConfig;
  if (isPlatformRegistration(cfg)) {
    return cfg.roles.filter((r) => !r.deleted);
  }
  return [];
});

const getRole = (roleUuid?: string): RegistrationRole | undefined => {
  if (!roleUuid) return undefined;
  return rolesList.value.find((r) => r.uuid === roleUuid);
};

// All active questions from event config
const allQuestions = computed<RegistrationQuestion[]>(() => {
  const cfg = event.value?.registrationConfig;
  if (!isPlatformRegistration(cfg)) return [];
  const res: RegistrationQuestion[] = [];
  for (const s of cfg.sections) {
    for (const q of s.questions) {
      if (!q.deleted) {
        res.push(q);
      }
    }
  }
  return res;
});

// Filters
const search = ref("");
const selectedRoleFilter = ref("all");
const selectedPaymentFilter = ref("all");

const roleFilterOptions = computed(() => [
  { label: "Všetky role", value: "all" },
  ...rolesList.value.map((r) => ({ label: r.name, value: r.uuid })),
]);

const paymentFilterOptions = [
  { label: "Všetky stavy platieb", value: "all" },
  { label: "Zaplatené", value: "paid" },
  { label: "Čaká na úhradu", value: "pending" },
  { label: "Bez poplatku", value: "free" },
];

const filteredRegistrations = computed(() => {
  let list = registrations.value;

  // Search filter
  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim();
    const qNorm = normalizeTeamName(search.value);
    list = list.filter((reg) => {
      const name = (
        reg.user?.name ||
        reg.collectedDetails?.name ||
        ""
      ).toLowerCase();
      const surname = (
        reg.user?.surname ||
        reg.collectedDetails?.surname ||
        ""
      ).toLowerCase();
      const email = (
        reg.user?.email ||
        reg.collectedDetails?.email ||
        ""
      ).toLowerCase();
      const teamRaw = reg.registrationData?.teamName || "";
      const team = teamRaw.toLowerCase();
      const teamNorm = normalizeTeamName(teamRaw);
      return (
        name.includes(q) ||
        surname.includes(q) ||
        email.includes(q) ||
        team.includes(q) ||
        (qNorm.length > 0 && teamNorm.includes(qNorm))
      );
    });
  }

  // Role filter
  if (selectedRoleFilter.value !== "all") {
    list = list.filter(
      (reg) => reg.registrationData?.roleUuid === selectedRoleFilter.value,
    );
  }

  // Payment filter
  if (selectedPaymentFilter.value !== "all") {
    list = list.filter((reg) => {
      const role = getRole(reg.registrationData?.roleUuid);
      const fee = role ? role.cost : 0;
      if (selectedPaymentFilter.value === "free") {
        return fee === 0 && !reg.payment;
      }
      if (selectedPaymentFilter.value === "paid") {
        return reg.payment?.status === "paid";
      }
      if (selectedPaymentFilter.value === "pending") {
        return (
          reg.payment?.status === "pending" ||
          reg.payment?.status === "processing" ||
          (fee > 0 && !reg.payment)
        );
      }
      return true;
    });
  }

  return list;
});

// Modal state for editing registration
const isEditModalOpen = ref(false);
const activeRegistration = ref<any | null>(null);

const editRoleUuid = ref("");
const editTeamName = ref("");
const editConfirmed = ref(true);
const editCollectedDetails = ref({
  name: "",
  surname: "",
  email: "",
  phone: "",
  birthDate: "",
  street: "",
  postalCode: "",
  town: "",
});
const editAnswers = ref<Record<string, any>>({});
const saving = ref(false);
const deleting = ref(false);

// Date conversion helpers
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

const openEditModal = (reg: any) => {
  activeRegistration.value = reg;
  editRoleUuid.value = reg.registrationData?.roleUuid ?? "";
  editTeamName.value = reg.registrationData?.teamName ?? "";
  editConfirmed.value = Boolean(reg.confirmed);

  // Populate editable details (from user or collectedDetails)
  editCollectedDetails.value = {
    name: reg.user?.name || reg.collectedDetails?.name || "",
    surname: reg.user?.surname || reg.collectedDetails?.surname || "",
    email: reg.user?.email || reg.collectedDetails?.email || "",
    phone: reg.user?.phone || reg.collectedDetails?.phone || "",
    birthDate: reg.user?.birthDate || reg.collectedDetails?.birthDate || "",
    street: reg.user?.street || reg.collectedDetails?.street || "",
    postalCode: reg.user?.postalCode || reg.collectedDetails?.postalCode || "",
    town: reg.user?.town || reg.collectedDetails?.town || "",
  };

  // Populate answers map
  const answersMap: Record<string, any> = {};
  for (const item of reg.registrationData?.questions ?? []) {
    answersMap[item.questionUuid] = item.answer;
  }
  editAnswers.value = answersMap;

  isEditModalOpen.value = true;
};

const saveRegistrationChanges = async () => {
  if (!activeRegistration.value) return;
  saving.value = true;
  try {
    const answersArray = Object.entries(editAnswers.value).map(
      ([questionUuid, answer]) => ({
        questionUuid,
        answer,
      }),
    );

    await $fetch(
      `/api/events/${slug}/registrations/${activeRegistration.value.id}`,
      {
        method: "PATCH",
        body: {
          roleUuid: editRoleUuid.value,
          teamName: editTeamName.value.trim() || null,
          confirmed: editConfirmed.value,
          collectedDetails: editCollectedDetails.value,
          answers: answersArray,
        },
      },
    );

    toast.add({
      title: "Registrácia upravená",
      description: "Všetky zmeny boli úspešne uložené.",
      color: "success",
      icon: "i-ph-check-circle",
    });

    isEditModalOpen.value = false;
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Chyba pri ukladaní",
      description: err.data?.message || "Nepodarilo sa uložiť zmeny.",
      color: "error",
      icon: "i-ph-warning-circle",
    });
  } finally {
    saving.value = false;
  }
};

const removeRegistration = async () => {
  if (!activeRegistration.value) return;

  const modal = overlay.create(LazyModalConfirm);
  const instance = modal.open({
    title: "Zmazať registráciu",
    description: `Naozaj chcete natrvalo odstrániť registráciu #${activeRegistration.value.id}? Táto akcia je nevratná.`,
    color: "error",
  });

  const shouldDelete = await instance.result;
  if (!shouldDelete) return;

  deleting.value = true;
  try {
    await $fetch(
      `/api/events/${slug}/registrations/${activeRegistration.value.id}`,
      {
        method: "DELETE",
      },
    );

    toast.add({
      title: "Registrácia zmazaná",
      description: "Registrácia bola úspešne odstránená.",
      color: "success",
      icon: "i-ph-trash",
    });

    isEditModalOpen.value = false;
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Chyba pri mazaní",
      description: err.data?.message || "Nepodarilo sa odstrániť registráciu.",
      color: "error",
      icon: "i-ph-warning-circle",
    });
  } finally {
    deleting.value = false;
  }
};

// Table columns
const columns = computed<TableColumn<any>[]>(() => {
  const baseCols: TableColumn<any>[] = [
    {
      accessorKey: "participant",
      header: "Účastník",
      cell: ({ row }) => {
        const reg = row.original;
        const name = reg.user?.name || reg.collectedDetails?.name || "Neznáme";
        const surname =
          reg.user?.surname || reg.collectedDetails?.surname || "";
        const email = reg.user?.email || reg.collectedDetails?.email || "—";
        const isUser = Boolean(reg.userId);

        return h("div", { class: "flex items-center gap-2" }, [
          h("div", { class: "flex flex-col" }, [
            h("div", { class: "flex items-center gap-1.5" }, [
              h(
                "span",
                { class: "font-semibold text-highlighted" },
                `${name} ${surname}`,
              ),
              h(
                UBadge,
                {
                  size: "xs",
                  variant: "subtle",
                  color: isUser ? "primary" : "neutral",
                },
                () => (isUser ? "Používateľ" : "Hosť"),
              ),
            ]),
            h("span", { class: "text-xs text-muted" }, email),
          ]),
        ]);
      },
    },
    {
      accessorKey: "role",
      header: "Rola",
      cell: ({ row }) => {
        const reg = row.original;
        const role = getRole(reg.registrationData?.roleUuid);
        return h(
          UBadge,
          {
            color: "info",
            variant: "subtle",
            size: "sm",
          },
          () => role?.name || "Neznáma",
        );
      },
    },
    {
      accessorKey: "team",
      header: "Tím",
      cell: ({ row }) => {
        const reg = row.original;
        const team = reg.registrationData?.teamName;
        if (!team) {
          return h("span", { class: "text-muted text-xs" }, "—");
        }
        return h(
          "span",
          { class: "font-medium text-highlighted text-xs" },
          team,
        );
      },
    },
  ];

  // Dynamic question columns for ALL questions in event sections
  const questionCols: TableColumn<any>[] = allQuestions.value.map((q) => ({
    accessorKey: `q_${q.uuid}`,
    header: q.title || "Otázka",
    cell: ({ row }) => {
      const qAnswers = row.original.registrationData?.questions ?? [];
      const found = qAnswers.find((a: any) => a.questionUuid === q.uuid);
      if (
        !found ||
        found.answer === null ||
        found.answer === undefined ||
        found.answer === ""
      ) {
        return h("span", { class: "text-muted text-xs italic" }, "—");
      }
      if (Array.isArray(found.answer)) {
        return h("span", { class: "text-xs" }, found.answer.join(", "));
      }
      if (typeof found.answer === "boolean") {
        return h(
          UBadge,
          {
            size: "xs",
            variant: "subtle",
            color: found.answer ? "success" : "neutral",
          },
          () => (found.answer ? "Áno" : "Nie"),
        );
      }
      return h(
        "span",
        { class: "text-xs max-w-xs truncate block" },
        String(found.answer),
      );
    },
  }));

  const endCols: TableColumn<any>[] = [
    {
      accessorKey: "confirmed",
      header: "Stav účasti",
      cell: ({ row }) => {
        const conf = Boolean(row.original.confirmed);
        return h(
          UBadge,
          {
            size: "sm",
            variant: "subtle",
            color: conf ? "success" : "warning",
          },
          () => (conf ? "Potvrdená" : "Čaká na súhlas zástupcu"),
        );
      },
    },
    {
      accessorKey: "payment",
      header: "Platba",
      cell: ({ row }) => {
        const reg = row.original;
        const role = getRole(reg.registrationData?.roleUuid);
        const fee = role ? role.cost : 0;

        if (reg.payment) {
          if (reg.payment.status === "paid") {
            return h(
              UBadge,
              { color: "success", variant: "subtle", size: "sm" },
              () => `Zaplatené (${reg.payment.amount / 100} €)`,
            );
          }
          return h(
            UBadge,
            { color: "warning", variant: "subtle", size: "sm" },
            () => `Čaká na úhradu (${reg.payment.amount / 100} €)`,
          );
        }

        if (fee > 0) {
          return h(
            UBadge,
            { color: "warning", variant: "subtle", size: "sm" },
            () => `Nezaplatené (${fee} €)`,
          );
        }

        return h(
          UBadge,
          { color: "neutral", variant: "subtle", size: "sm" },
          () => "Bez poplatku",
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Dátum registrácie",
      cell: ({ row }) => {
        const d = row.original.createdAt;
        return d
          ? new Date(d).toLocaleDateString("sk-SK", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";
      },
    },
    {
      id: "actions",
      header: "Akcie",
      cell: ({ row }) => {
        return h(UButton, {
          icon: "i-ph-pencil-simple",
          size: "xs",
          color: "primary",
          variant: "subtle",
          label: "Upraviť",
          onClick: () => openEditModal(row.original),
        });
      },
    },
  ];

  return [...baseCols, ...questionCols, ...endCols];
});
</script>

<template>
  <div class="w-full h-full">
    <UDashboardPanel id="registrations-panel">
      <template #header>
        <UDashboardNavbar
          :title="`Registrácie: ${event?.name ?? ''}`"
          :ui="{ right: 'gap-3' }">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>

        <UDashboardToolbar
          class="flex flex-col sm:flex-row items-center justify-between gap-4 max-sm:py-4">
          <div class="flex items-center gap-4 text-sm text-muted">
            <UButton
              :to="`/manage/events/${slug}/edit`"
              icon="i-ph-arrow-left"
              color="neutral"
              variant="subtle"
              size="xs"
              label="Späť na úpravu podujatia" />
            <span>
              Celkovo registrácií:
              <span class="font-bold text-highlighted">
                {{ registrations.length }}
              </span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              label="Exportovať do Excelu"
              :to="`/api/events/${slug}/registrations/export`"
              download
              target="_blank"
              color="primary"
              variant="solid"
              icon="i-ph-file-xls" />
          </div>
        </UDashboardToolbar>
      </template>

      <template #body>
        <div class="space-y-4">
          <!-- Filters row -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <UInput
              v-model="search"
              icon="i-ph-magnifying-glass"
              placeholder="Vyhľadať meno, email, tím..."
              class="w-full" />

            <USelect
              v-model="selectedRoleFilter"
              :items="roleFilterOptions"
              class="w-full" />

            <USelect
              v-model="selectedPaymentFilter"
              :items="paymentFilterOptions"
              class="w-full" />
          </div>

          <!-- Registrations Table -->
          <UTable
            :data="filteredRegistrations"
            :columns="columns"
            :loading="status === 'pending'" />
        </div>
      </template>
    </UDashboardPanel>

    <!-- Details and Comprehensive Edit Modal -->
    <UModal
      v-model:open="isEditModalOpen"
      :title="`Úprava registrácie #${activeRegistration?.id ?? ''}`"
      description="Úprava údajov účastníka, odpovedí na otázky a stavu účasti"
      :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <div v-if="activeRegistration" class="space-y-6">
          <!-- Role, Team & Confirmation -->
          <div class="space-y-4">
            <h4
              class="text-xs font-semibold uppercase text-muted tracking-wider">
              Základné nastavenie registrácie
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Priradená rola">
                <USelect
                  v-model="editRoleUuid"
                  :items="
                    rolesList.map((r) => ({ label: r.name, value: r.uuid }))
                  "
                  class="w-full" />
              </UFormField>

              <UFormField label="Názov tímu">
                <UInput
                  v-model="editTeamName"
                  placeholder="Zadajte názov tímu"
                  class="w-full" />
              </UFormField>
            </div>

            <div class="pt-2">
              <USwitch
                v-model="editConfirmed"
                label="Potvrdená účasť"
                description="Indikuje, či je účasť potvrdená (napr. súhlasom zákonného zástupcu alebo organizátorom)" />
            </div>
          </div>

          <USeparator />

          <!-- Participant Info Edit Fields -->
          <div class="space-y-4">
            <h4
              class="text-xs font-semibold uppercase text-muted tracking-wider">
              Osobné a kontaktné údaje účastníka
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Meno">
                <UInput
                  v-model="editCollectedDetails.name"
                  placeholder="Meno"
                  class="w-full" />
              </UFormField>

              <UFormField label="Priezvisko">
                <UInput
                  v-model="editCollectedDetails.surname"
                  placeholder="Priezvisko"
                  class="w-full" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="E-mailová adresa">
                <UInput
                  v-model="editCollectedDetails.email"
                  type="email"
                  placeholder="email@example.sk"
                  class="w-full" />
              </UFormField>

              <UFormField label="Telefónne číslo">
                <UInput
                  v-model="editCollectedDetails.phone"
                  placeholder="+421 900 000 000"
                  class="w-full" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="Dátum narodenia">
                <UInputDate
                  :model-value="toCalendarDate(editCollectedDetails.birthDate)"
                  class="w-full"
                  @update:model-value="
                    (val) =>
                      (editCollectedDetails.birthDate =
                        fromCalendarDate(val) || '')
                  " />
              </UFormField>

              <UFormField label="Ulica a číslo">
                <UInput
                  v-model="editCollectedDetails.street"
                  placeholder="Hlavná 123"
                  class="w-full" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField label="PSČ">
                <UInput
                  v-model="editCollectedDetails.postalCode"
                  placeholder="811 01"
                  class="w-full" />
              </UFormField>

              <UFormField label="Mesto / Obec">
                <UInput
                  v-model="editCollectedDetails.town"
                  placeholder="Bratislava"
                  class="w-full" />
              </UFormField>
            </div>
          </div>

          <USeparator />

          <!-- Dynamic Question Answers Edit Fields -->
          <div class="space-y-4">
            <h4
              class="text-xs font-semibold uppercase text-muted tracking-wider">
              Odpovede na otázky z formulára
            </h4>

            <div
              v-if="allQuestions.length === 0"
              class="text-sm text-muted py-2">
              Toto podujatie nemá žiadne doplňujúce otázky.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="q in allQuestions"
                :key="q.uuid"
                class="p-4 bg-elevated/20 rounded-lg border border-default/40 space-y-2">
                <!-- Text -->
                <UFormField
                  v-if="q.type === 'text'"
                  :label="q.title"
                  :description="q.description">
                  <UInput
                    v-model="editAnswers[q.uuid]"
                    placeholder="Odpoveď..."
                    class="w-full" />
                </UFormField>

                <!-- Number -->
                <UFormField
                  v-else-if="q.type === 'number'"
                  :label="q.title"
                  :description="q.description">
                  <UInput
                    v-model.number="editAnswers[q.uuid]"
                    type="number"
                    placeholder="0"
                    class="w-full" />
                </UFormField>

                <!-- Date -->
                <UFormField
                  v-else-if="q.type === 'date'"
                  :label="q.title"
                  :description="q.description">
                  <UInputDate
                    :model-value="toCalendarDate(editAnswers[q.uuid])"
                    class="w-full"
                    @update:model-value="
                      (val) => (editAnswers[q.uuid] = fromCalendarDate(val))
                    " />
                </UFormField>

                <!-- Boolean -->
                <UFormField
                  v-else-if="q.type === 'boolean'"
                  :label="q.title"
                  :description="q.description">
                  <div class="pt-1">
                    <UCheckbox v-model="editAnswers[q.uuid]" :label="q.title" />
                  </div>
                </UFormField>

                <!-- Select -->
                <UFormField
                  v-else-if="q.type === 'select'"
                  :label="q.title"
                  :description="q.description">
                  <URadioGroup
                    v-model="editAnswers[q.uuid]"
                    :items="q.options"
                    color="primary"
                    class="space-y-2 pt-1" />
                </UFormField>

                <!-- Multiselect -->
                <UFormField
                  v-else-if="q.type === 'multiselect'"
                  :label="q.title"
                  :description="q.description">
                  <UCheckboxGroup
                    v-model="editAnswers[q.uuid]"
                    :items="q.options"
                    color="primary"
                    class="space-y-2 pt-1" />
                </UFormField>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <UButton
            color="error"
            variant="ghost"
            icon="i-ph-trash"
            label="Zmazať registráciu"
            :loading="deleting"
            @click="removeRegistration" />

          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="subtle"
              label="Zrušiť"
              @click="isEditModalOpen = false" />
            <UButton
              color="primary"
              label="Uložiť zmeny"
              icon="i-ph-floppy-disk"
              :loading="saving"
              @click="saveRegistrationChanges" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
