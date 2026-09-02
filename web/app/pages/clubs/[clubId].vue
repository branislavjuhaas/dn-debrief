<script setup lang="ts">
import {
  LazyModalAddClubManager,
  LazyModalConfirm,
  LazyModalEditClub,
} from "#components";
import type { TableColumn, TabsItem } from "@nuxt/ui";
import type { RowSelectionState } from "@tanstack/vue-table";

// Page metadata & route parameters
definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const clubId = route.params.clubId as NonEmptyString;

// Club details data fetching
await useFetch(`/api/clubs/${clubId}`, {
  key: `clubs-${clubId}`,
});

const { data: clubData } = useNuxtData<{
  club: Club & { membershipsCount: number; isDeletable: boolean };
}>(`clubs-${clubId}`);

if (!clubData?.value?.club) {
  throw createError({
    statusCode: 404,
    statusMessage: "Debatný klub nenájdený",
    message: `Debatný klub s identifkačným číslom ${clubId} zatiaľ neexistuje.`,
  });
}

useSeoMeta({
  title: `Debatný klub ${clubData?.value?.club.name ?? ""}`.trim(),
  description: `Profil debatného klubu ${clubData?.value?.club.name ?? ""} s prehľadom správcov/-kýň, členov/-iek a ďalších informácií.`,
});

// Current user & club permissions
const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const { data: clubManagers } = await useFetch(`/api/clubs/${clubId}/managers`, {
  key: `clubs-${clubId}-managers`,
});

const isUserClubManager = computed(() => {
  if (!userData?.value?.user || !clubManagers?.value) {
    return false;
  }

  return clubManagers.value.managers.some(
    (manager) => manager.id === userData.value?.user?.id,
  );
});

const isAdminOrDeveloper = computed(() =>
  ["developer", "admin"].includes(userData?.value?.user?.role ?? "user"),
);

const canManageClub = computed(
  () => isUserClubManager.value || isAdminOrDeveloper.value,
);

// Club members & unpaid payments data
const { data: clubMembers } = await useFetch(
  `/api/clubs/${clubId}/memberships`,
  {
    key: `clubs-${clubId}-memberships`,
    enabled: canManageClub,
  },
);

const {
  data: clubPayments,
  execute: fetchPayments,
  status: paymentsStatus,
} = await useFetch(`/api/clubs/${clubId}/payments`, {
  key: `clubs-${clubId}-payments`,
  lazy: true,
  immediate: false,
});

// Tabs navigation & lifecycle
const selectedTab = ref("0");

const tabItems = computed<TabsItem[]>(() => [
  {
    label: "Členovia/-ky klubu",
    slot: "members",
  },
  {
    label: "Registrácie na podujatia",
    slot: "registrations",
    disabled: true,
  },
  {
    label: "Neuhradené platby",
    slot: "payments",
    disabled: !canManageClub.value,
  },
]);

watch(
  selectedTab,
  async (newTab) => {
    if (newTab === "2" && !clubPayments.value) {
      await fetchPayments();
    }
  },
  { immediate: true },
);

// Resolved UI components
const UUser = resolveComponent("UUser");
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UCheckbox = resolveComponent("UCheckbox");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const overlay = useOverlay();
const toast = useToast();

// Club administration actions
const editClub = async () => {
  const modal = overlay.create(LazyModalEditClub);
  modal.open({
    club: clubData?.value?.club as Club,
  });
};

const deleteClub = async () => {
  const modal = overlay.create(LazyModalConfirm);
  const instance = modal.open({
    title: "Vymazať klub",
    description: `Naozaj chcete vymazať debatný klub ${clubData?.value?.club.name}?`,
    color: "error",
  });

  const shouldDelete = await instance.result;

  if (shouldDelete) {
    await $fetch(`/api/clubs/${clubId as NonEmptyString}`, {
      method: "DELETE",
      onResponseError() {
        toast.add({
          title: "Nepodarilo sa vymazať klub",
          description: "Skúste to znova.",
          color: "error",
        });
      },
      async onResponse({ response }) {
        if (response.ok) {
          toast.add({
            title: `Debatný klub ${clubData?.value?.club.name} bol úspešne vymazaný`,
            color: "success",
          });
          await refreshNuxtData("clubs");
          navigateTo("/manage/clubs");
        }
      },
    });
  }
};

const addClubManager = async () => {
  const modal = overlay.create(LazyModalAddClubManager);
  modal.open({
    clubId: clubData?.value?.club.id as number,
    userRole: userData?.value?.user?.role,
  });
};

const deleteClubManager = async (managerId: number) => {
  let previousManagers: typeof clubManagers.value = { managers: [] };

  await $fetch(`/api/clubs/${clubId}/managers/${managerId}`, {
    method: "DELETE",
    onRequest() {
      if (!clubManagers.value) {
        return;
      }

      previousManagers = { ...clubManagers.value };

      clubManagers.value.managers = clubManagers.value?.managers.filter(
        (m) => m.id !== managerId,
      );
    },
    onResponseError() {
      clubManagers.value = previousManagers;
      toast.add({
        title: "Nepodarilo sa odstrániť správcu/-kyňu klubu",
        description: "Skúste to znova.",
        color: "error",
      });
    },
    async onResponse() {
      await refreshNuxtData(`clubs-${clubId}-managers`);
    },
  });
};

// Members table configuration
const membersColumns: TableColumn<{
  confirmed: boolean;
  registrationType:
    | "junior_student"
    | "senior_student"
    | "graduate"
    | "teacher";
  user?: {
    id: number;
    name: string;
    surname: string;
    image: string | null;
    email: string;
    role: UserRole;
  };
}>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "ID",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    accessorFn: (row) => `#${row.user?.id ?? "N/A"}`,
  },
  {
    id: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Meno a priezvisko",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const name = row.original.user?.name ?? "N/A";
      const surname = row.original.user?.surname ?? "N/A";

      return h(
        UUser,
        {
          name: name,
          surname: surname,
          avatar: {
            src: row.original.user?.image ?? undefined,
            alt: `${name} ${surname}`,
          },
          to: `/users/${row.original.user?.id}`,
          size: "xs",
        },
        {
          default: () =>
            h(
              "NuxtLink",
              {
                to: `/users/${row.original.user?.id}`,
                class: "font-medium text-default hover:text-highlighted",
              },
              `${name} ${surname}`,
            ),
        },
      );
    },
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => row.original.user?.email ?? "N/A",
  },
  {
    id: "registrationType",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Typ registrácie",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const color = {
        junior_student: "info" as const,
        senior_student: "olive" as const,
        graduate: "rose" as const,
        teacher: "purple" as const,
      }[row.original.registrationType];

      return h(UBadge, { variant: "subtle", color }, () =>
        translateRegistrationType(row.original.registrationType),
      );
    },
  },
  {
    id: "role",
    header: "Rola",
    cell: ({ row }) => translateRole(row.original.user?.role),
  },
];

// Club payments table & batch resolution
type ClubPaymentRow = {
  id: string;
  description: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    surname: string;
    image: string | null;
  };
};

const rowSelection = ref<RowSelectionState>({});

const selectedPaymentIds = computed<string[]>(() =>
  Object.keys(rowSelection.value)
    .filter((id) => rowSelection.value[id])
    .map((id) => clubPayments.value?.payments[Number(id)]?.id)
    .filter((id): id is string => id !== undefined),
);

const hasPaymentSelection = computed(() => selectedPaymentIds.value.length > 0);

const refreshClubPayments = async () => {
  await refreshNuxtData(`clubs-${clubId}-payments`);
};

const changePaymentsStatus = async () => {
  await promptBatchResolvePayments(selectedPaymentIds.value, {
    onUpdated: async () => {
      await refreshClubPayments();
      rowSelection.value = {};
    },
  });
};

const paymentsColumns: TableColumn<ClubPaymentRow>[] = [
  {
    id: "select",
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? "indeterminate"
          : table.getIsAllPageRowsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Vybrať všetky",
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        "onUpdate:modelValue": (value: boolean | "indeterminate") =>
          row.toggleSelected(!!value),
        "aria-label": "Vybrať riadok",
      }),
  },
  {
    id: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Meno a priezvisko",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-ph-sort-ascending"
            : "i-ph-sort-descending"
          : "i-ph-funnel-simple",
        class: "-mx-2.5 font-bold text-highlighted",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const name = row.original.user?.name ?? "N/A";
      const surname = row.original.user?.surname ?? "N/A";

      return h(
        UUser,
        {
          name: name,
          surname: surname,
          avatar: {
            src: row.original.user?.image ?? undefined,
            alt: `${name} ${surname}`,
          },
          to: `/users/${row.original.user?.id}`,
          size: "xs",
        },
        {
          default: () =>
            h(
              "NuxtLink",
              {
                to: `/users/${row.original.user?.id}`,
                class: "font-medium text-default hover:text-highlighted",
              },
              `${name} ${surname}`,
            ),
        },
      );
    },
  },
  {
    accessorKey: "description",
    header: "Popis",
  },
  {
    accessorKey: "createdAt",
    header: "Vytvorená",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: "end",
          },
          items: getPaymentRowItems(row.original, {
            canAdjustAmount: false,
            onUpdated: refreshClubPayments,
          }),
          "aria-label": "Akcie",
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            disabled: !isAdminOrDeveloper.value,
            "aria-label": "Akcie",
          }),
      );
    },
  },
];
</script>

<template>
  <UPage>
    <UPageHeader :title="`Debatný klub ${clubData?.club.name}`">
      <template #links v-if="userData?.user && isAdminOrDeveloper">
        <UTooltip
          v-if="!clubData?.club.isDeletable"
          text="Klub je možné vymazať len v prípade, že nikdy nemal žiadnych/-e členov/-ky">
          <UButton
            label="Vymazať klub"
            icon="i-ph-x"
            variant="subtle"
            color="error"
            disabled
            class="text-sm" />
        </UTooltip>
        <UButton
          v-else
          label="Vymazať klub"
          icon="i-ph-x"
          variant="subtle"
          color="error"
          :disabled="!clubData?.club.isDeletable"
          class="text-sm"
          @click="deleteClub" />
        <UButton
          label="Upraviť klub"
          icon="i-ph-pencil-simple"
          variant="solid"
          color="primary"
          class="text-sm"
          @click="editClub" />
      </template>
    </UPageHeader>
    <UPageBody>
      <UAlert
        v-if="!clubData?.club.isActive"
        title="Tento klub je momentálne neaktívny a nie je možné sa stať jeho členom/-kou."
        icon="i-ph-moon-stars-fill"
        variant="subtle"
        color="error"
        class="mb-4" />
      <UCard
        :ui="{
          root: 'mb-4',
          body: 'flex flex-col md:flex-row gap-1 md:gap-8',
        }">
        <div class="flex flex-col gap-1 -m-3 p-3 rounded-lg md:bg-elevated">
          <ProfileDetail
            label="Počet členov/-iek"
            icon="i-ph-users-three-fill"
            :value="clubData?.club.membershipsCount" />
          <ProfileDetail
            label="Debatný program"
            icon="i-ph-ranking-fill"
            :value="translateLeague(clubData?.club.league)" />
          <ProfileDetail
            label="Región"
            icon="i-ph-globe-hemisphere-west-fill"
            :value="translateRegion(clubData?.club.region)" />
        </div>

        <div class="flex flex-col gap-2">
          <span class="space-x-2 text-sm items-center flex text-pretty">
            <UIcon name="i-ph-user-circle-check-fill" class="size-5" />
            <span class="font-bold">Správcovia/-kyne klubu</span>
          </span>
          <div class="flex flex-row flex-wrap gap-2">
            <UContextMenu
              v-if="userData?.user && isAdminOrDeveloper"
              v-for="manager in clubManagers?.managers"
              :items="[
                {
                  label: 'Odstrániť',
                  icon: 'i-ph-x',
                  color: 'error',
                  onClick: () => deleteClubManager(manager.id),
                },
              ]">
              <UUser
                :key="manager.id"
                :name="`${manager.name} ${manager.surname}`"
                :description="manager.email ?? undefined"
                :to="`/users/${manager.id}`"
                :ui="{ name: 'text-sm', avatar: 'bg-default', root: 'gap-0' }"
                :avatar="{
                  src: manager.image ?? undefined,
                  alt: `${manager.name} ${manager.surname}`,
                  loading: 'lazy',
                }"
                size="xs"
                class="p-1 px-2 rounded-md bg-elevated" />
            </UContextMenu>
            <UUser
              v-else
              v-for="manager in clubManagers?.managers"
              :key="manager.id"
              :name="`${manager.name} ${manager.surname}`"
              :to="`/users/${manager.id}`"
              :ui="{ name: 'text-sm', avatar: 'bg-default', root: 'gap-0' }"
              :avatar="{
                src: manager.image ?? undefined,
                alt: `${manager.name} ${manager.surname}`,
                loading: 'lazy',
              }"
              size="xs"
              class="p-1 px-2 rounded-md bg-elevated" />
            <UButton
              v-if="userData?.user && canManageClub"
              label="Pridať"
              icon="i-ph-plus"
              variant="soft"
              color="neutral"
              class="text-sm"
              @click="addClubManager" />
          </div>
        </div>
      </UCard>
      <UTabs
        v-if="canManageClub"
        v-model="selectedTab"
        :items="tabItems"
        variant="link"
        :ui="{
          content: 'overflow-x-auto scrollbar-none',
        }">
        <template #members>
          <UTable
            :data="clubMembers?.memberships ?? []"
            :columns="membersColumns as any"
            class="flex-1" />
        </template>
        <template #payments>
          <UTable
            v-model:row-selection="rowSelection"
            :data="clubPayments?.payments ?? []"
            :columns="paymentsColumns as any"
            :loading="paymentsStatus !== 'success'"
            class="flex-1" />
          <div class="flex flex-row justify-end gap-4 mt-4">
            <UButton
              label="Zmeniť stav platieb"
              icon="i-ph-seal-check"
              color="neutral"
              variant="subtle"
              :disabled="!hasPaymentSelection"
              :loading="paymentsStatus !== 'success'"
              auto-loading
              @click="changePaymentsStatus" />
          </div>
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>
