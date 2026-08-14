<script setup lang="ts">
import {
  LazyModalEditClub,
  LazyModalConfirm,
  LazyModalAddClubManager,
} from "#components";
import type { TableColumn, TabsItem } from "@nuxt/ui";

const tabItems = ref<TabsItem[]>([
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
    label: "Platby",
    slot: "payments",
    disabled: true,
  },
]);

const route = useRoute();
const clubId = route.params.clubId as NonEmptyString;

await useFetch(`/api/clubs/${clubId}`, {
  key: `clubs-${clubId}`,
  onResponseError({ response }) {
    if (response.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: "Debatný klub nenájdený",
      });
    }
  },
});

const { data: clubData } = useNuxtData<{
  club: Club & { membershipsCount: number; isDeletable: boolean };
}>(`clubs-${clubId}`);

useSeoMeta({
  title: `Debatný klub ${clubData?.value?.club.name ?? ""}`.trim(),
  description: `Profil debatného klubu ${clubData?.value?.club.name ?? ""} s prehľadom správcov/-kýň, členov/-iek a ďalších informácií.`,
});

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

const { data: clubMembers } = await useFetch(
  `/api/clubs/${clubId}/memberships`,
  {
    key: `clubs-${clubId}-memberships`,
    enabled: computed(
      () =>
        isUserClubManager.value ||
        ["developer", "admin"].includes(userData?.value?.user?.role ?? "user"),
    ),
  },
);

const UUser = resolveComponent("UUser");
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const overlay = useOverlay();
const toast = useToast();

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
      onResponseError({ response }) {
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

const columns: TableColumn<{
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
        teacher: "violet" as const,
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
</script>

<template>
  <UPage>
    <UPageHeader :title="`Debatný klub ${clubData?.club.name}`">
      <template
        #links
        v-if="
          userData?.user &&
          ['developer', 'admin'].includes(userData.user.role ?? 'user')
        ">
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
        <div class="flex flex-col gap-1 -m-3 p-3 rounded-lg bg-elevated">
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
              v-if="
                userData?.user &&
                ['developer', 'admin'].includes(userData.user.role ?? 'user')
              "
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
              v-if="
                userData?.user &&
                (isUserClubManager ||
                  ['developer', 'admin'].includes(userData.user.role ?? 'user'))
              "
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
        :items="tabItems"
        variant="link"
        :ui="{
          content: 'overflow-x-auto scrollbar-none',
        }">
        <template #members>
          <UTable
            :data="clubMembers?.memberships ?? []"
            :columns="columns as any"
            class="flex-1" />
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>
