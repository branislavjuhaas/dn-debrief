<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

const open = defineModel("open", {
  type: Boolean,
  required: false,
  default: false,
});

const searchTerm = ref("");
const searchTermDebounced = refDebounced(searchTerm, 200);

const { data } = await useFetch("/api/search", {
  params: { term: searchTermDebounced },
  transform: (raw: any) => {
    const payload = (raw && (raw.data ?? raw)) as {
      users: {
        id: number;
        name: string;
        surname: string;
        role: Role;
        image: string;
      }[];
      clubs: { id: number; name: string }[];
      events: { id: number; name: string; season: string }[];
    };

    return {
      users: (payload.users || []).map((user) => ({
        id: user.id,
        label: `${user.name} ${user.surname}`,
        suffix: useCapitalize(useTranslate("role", user.role)),
        avatar: {
          src: user.image,
          alt: `${user.name} ${user.surname}`,
        },
        to: `/users/${user.id}`,
      })),
      clubs: (payload.clubs || []).map((club) => ({
        id: club.id,
        label: club.name,
        type: "club",
        icon: "ph:bank",
        to: `/clubs/${club.id}`,
      })),
      events: (payload.events || []).map((event) => ({
        id: event.id,
        label: event.name,
        subtitle: event.season,
        type: "event",
        icon: "ph:ticket",
        to: `/events/${event.id}`,
      })),
    };
  },
});

const groups = computed(() => [
  {
    id: "users",
    label: "Používatelia",
    items: data.value?.users,
    ignoreFilter: true,
  },
  {
    id: "clubs",
    label: "Debatné kluby",
    items: data.value?.clubs,
    ignoreFilter: true,
  },
  {
    id: "events",
    label: "Podujatia",
    items: data.value?.events,
    ignoreFilter: true,
  },
]);
</script>

<template>
  <UDashboardSearch
    v-model:search-term="searchTerm"
    v-model:open="open"
    :groups="groups"
    placeholder="Hľadajte ľudí, podujatia a kluby..." />
</template>

<style scoped></style>
