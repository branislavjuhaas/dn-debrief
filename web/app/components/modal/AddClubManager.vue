<script lang="ts" setup>
import { refDebounced } from "@vueuse/core";
import type { AvatarProps } from "@nuxt/ui";

const emit = defineEmits(["close"]);

const props = defineProps<{
  clubId: number;
}>();

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
      <UFormField label="Používateľ/-ka" name="user">
        <UInputMenu
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
      </UFormField>
    </template>
    <template #footer>
      <UButton
        :loading="addingManager"
        color="primary"
        block
        @click="addManager">
        Pridať správcu/-kyňu
      </UButton>
    </template>
  </UModal>
</template>
