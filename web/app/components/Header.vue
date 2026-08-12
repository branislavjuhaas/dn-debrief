<script setup lang="ts">
import type { CommandPaletteGroup } from "@nuxt/ui";
import type { UserRole } from "#shared/types/user";
import { refDebounced } from "@vueuse/core";

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const searchTerm = ref("");
const searchTermDebounced = refDebounced(searchTerm, 200);

const { data, status } = useLazyFetch("/api/search", {
  key: "header-search",
  params: { q: searchTermDebounced },
  server: false,
});

const results = computed<CommandPaletteGroup[]>(() => {
  return [
    {
      id: "users",
      label: "Použiívatelia/-ky",
      items: data.value?.users.map((user) => ({
        id: user.id,
        label: `${user.name} ${user.surname}`,
        suffix: user.email ?? translateRole((user.role as UserRole) ?? "user"),
        to: `/users/${user.id}`,
        avatar: {
          src: user.image ?? undefined,
          alt: `${user.name} ${user.surname}`,
          loading: "lazy" as const,
        },
      })),
      ignoreFilter: true,
    },
    {
      id: "clubs",
      label: "Debatné kluby",
      items: data.value?.clubs.map((club) => ({
        id: club.id,
        label: club.name,
        to: `/clubs/${club.id}`,
        icon: "i-ph-bank",
      })),
      ignoreFilter: true,
    },
    {
      id: "events",
      label: "Podujatia",
      items:
        data.value?.events.map((event) => ({
          id: event.id,
          label: event.name,
          icon: "i-ph-ticket",
        })) ?? [],
      ignoreFilter: true,
    },
  ];
});

const open = ref(false);
</script>

<template>
  <UHeader :toggle="false">
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2" aria-label="Domov">
        <DebriefLogo />
      </NuxtLink>
    </template>
    <UDashboardSearchButton
      class="w-96"
      :disabled="!userData?.user"
      icon="i-ph-magnifying-glass"
      @click="open = true">
      {{
        userData?.user
          ? "Hľadať ľudí, podujatia a kluby..."
          : "Pre vyhľadávanie sa prihláste"
      }}
    </UDashboardSearchButton>
    <UDashboardSearch
      v-model:open="open"
      v-model:search-term="searchTerm"
      :loading="status === 'pending' || status === 'idle'"
      :groups="results"
      :color-mode="false" />
    <template #right>
      <UDashboardSearchButton
        :disabled="!userData?.user"
        class="lg:hidden"
        collapsed
        icon="i-ph-magnifying-glass"
        @click="open = true" />
      <HeaderNav />
    </template>
  </UHeader>
</template>

<style scoped></style>
