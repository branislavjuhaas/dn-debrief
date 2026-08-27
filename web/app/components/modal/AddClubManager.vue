<script lang="ts" setup>
import { refDebounced } from "@vueuse/core";
import type { AvatarProps } from "@nuxt/ui";
import { UInputMenu } from "#components";

const emit = defineEmits(["close"]);

const props = defineProps<{
  clubId: number;
  userRole: UserRole | undefined;
}>();

const isAdminOrDeveloper = computed(() =>
  ["developer", "admin"].includes(props.userRole ?? ""),
);

const addingManager = ref(false);

const toast = useToast();

const searchTerm = ref("");
const searchTermDebounced = refDebounced(searchTerm, 200);

const selectedUser = ref<{
  label: string;
  value: string;
  avatar: {
    src: string | undefined;
    alt: string;
    loading: "lazy";
  };
}>();

const { data: clubManagers } = await useFetch(
  `/api/clubs/${props.clubId}/managers`,
  {
    key: `clubs-${props.clubId}-managers`,
  },
);

const { data: clubMemberships } = await useFetch(
  `/api/clubs/${props.clubId}/memberships`,
  {
    key: `clubs-${props.clubId}-memberships`,
    enabled: isAdminOrDeveloper.value,
  },
);

const clubMembers = clubMemberships.value
  ? clubMemberships.value?.memberships
      ?.filter(
        (membership) =>
          !clubManagers.value?.managers.some(
            (manager) => manager.id === membership.user?.id,
          ),
      )
      .map((membership) => ({
        label: `${membership.user?.name} ${membership.user?.surname}`,
        value: String(membership.user?.id),
        avatar: {
          src: membership.user?.image ?? undefined,
          alt: `${membership.user?.name} ${membership.user?.surname}`,
          loading: "lazy" as const,
        },
      }))
  : [];

const {
  data: users,
  status,
  execute,
} = await useLazyFetch(`/api/search`, {
  key: "add-club-manager-search",
  query: {
    q: searchTermDebounced,
    users: "true",
    clubs: "false",
    events: "false",
  },
  transform: (data: {
    users: {
      id: number;
      name: string;
      surname: string;
      image: string | null;
      email?: string;
    }[];
  }) => {
    // filter out users that are already club managers
    return data?.users
      ?.filter(
        (user) =>
          !clubManagers.value?.managers.some(
            (manager) => manager.id === user.id,
          ),
      )
      .map((user) => ({
        label: `${user.name} ${user.surname}`,
        value: String(user.id),
        description: user.email ?? null,
        avatar: {
          src: user.image ?? undefined,
          alt: `${user.name} ${user.surname}`,
          loading: "lazy" as const,
        },
      }));
  },
  immediate: false,
});

function onOpen() {
  if (!users.value?.length) {
    execute();
  }
}

const addManager = async () => {
  if (!selectedUser.value) return;

  addingManager.value = true;

  await $fetch(`/api/clubs/${props.clubId}/managers`, {
    method: "POST",
    body: {
      // parse the value to number because the API expects a number
      userId: Number(selectedUser.value.value),
    },
    onResponseError({ response }) {
      toast.add({
        title: "Nepodarilo sa pridať správcu/-kyňu klubu",
        description:
          "Skontrolujte zadané údaje a skúste to znova. Ak problém pretrváva, kontaktujte administrátora.",
        color: "error",
      });
    },
    async onResponse({ response }) {
      if (response.ok) {
        await refreshNuxtData(`clubs-${props.clubId}-managers`);
        emit("close");
      }
    },
  });
};
</script>

<template>
  <UModal title="Pridať správcu/-kyňu klubu">
    <template #body>
      <UAlert
        :title="
          isAdminOrDeveloper
            ? 'Ako administrátor/-ka môžete pridať ľubovoľného/-ú používateľa/-ku ako správcu/-kyňu klubu.'
            : 'Ako správca/-kyňa klubu môžete pridať za správcu/-kyňu klubu len existujúceho/-u člena/-ku klubu.'
        "
        :icon="isAdminOrDeveloper ? 'i-ph-seal-check' : 'i-ph-seal-warning'"
        variant="subtle"
        color="neutral"
        class="mb-4" />
      <UFormField label="Používateľ/-ka" name="user">
        <UInputMenu
          v-if="isAdminOrDeveloper"
          v-model="selectedUser"
          v-model:search-term="searchTerm"
          :items="users"
          :loading="status === 'pending'"
          icon="i-ph-user-plus"
          placeholder="Vyberte používateľa/-ku"
          class="w-full"
          @update:open="onOpen">
          <template #leading="{ modelValue, ui }">
            <UAvatar
              v-if="modelValue"
              v-bind="modelValue.avatar"
              :size="ui.leadingAvatarSize() as AvatarProps['size']"
              :class="ui.leadingAvatar()" />
          </template>
        </UInputMenu>
        <UInputMenu
          v-else
          v-model="selectedUser"
          :items="clubMembers"
          icon="i-ph-user-plus"
          placeholder="Vyberte používateľa/-ku"
          class="w-full"
          @update:open="onOpen">
          <template #leading="{ modelValue, ui }">
            <UAvatar
              v-if="modelValue"
              v-bind="modelValue.avatar"
              :size="ui.leadingAvatarSize() as AvatarProps['size']"
              :class="ui.leadingAvatar()" />
          </template>
        </UInputMenu>
      </UFormField>
    </template>
    <template #footer>
      <UButton
        :loading="addingManager"
        color="primary"
        block
        :disabled="!selectedUser"
        @click="addManager">
        Pridať správcu/-kyňu
      </UButton>
    </template>
  </UModal>
</template>
