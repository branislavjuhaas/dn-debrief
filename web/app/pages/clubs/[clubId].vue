<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const route = useRoute();

await useFetch(`/api/clubs/${route.params.clubId}`, {
  key: `clubs-${route.params.clubId}`,
});

const { data: clubData } = useNuxtData<{
  club: Club & { membershipsCount: number; isDeletable: boolean };
}>(`clubs-${route.params.clubId}`);

const { data: clubManagers } = await useFetch(
  `/api/clubs/${route.params.clubId}/managers`,
  {
    key: `clubs-${route.params.clubId}-managers`,
  },
);

const links = ref<ButtonProps[]>([
  {
    label: "Vymazať klub",
    icon: "i-ph-x",
    variant: "subtle",
    color: "error",
    disabled: !clubData?.value?.club.isDeletable,
  },
  {
    label: "Upraviť klub",
    icon: "i-ph-pencil-simple",
    variant: "solid",
    color: "primary",
  },
]);
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
          class="text-sm" />
        <UButton
          label="Upraviť klub"
          icon="i-ph-pencil-simple"
          variant="solid"
          color="primary"
          class="text-sm" />
      </template>
    </UPageHeader>
    <UPageBody>
      <UCard :ui="{ body: 'flex flex-col md:flex-row gap-1 md:gap-12' }">
        <div class="flex flex-col gap-1">
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
            <UUser
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
              label="Pridať"
              icon="i-ph-plus"
              variant="soft"
              color="neutral"
              class="text-sm" />
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>
