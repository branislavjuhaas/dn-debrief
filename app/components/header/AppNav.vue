<script setup lang="ts">
import { createAuthClient } from "better-auth/vue";

const authClient = createAuthClient();
const userStore = useUserStore();

const logout = async () => {
  authClient.signOut();
  userStore.clear();
};

const navItems = ref([
  [
    {
      label: "Môj profil",
      icon: "ph:identification-card",
      to: "/profile",
    },
    {
      label: "Moje platby",
      icon: "ph:coins",
      disabled: true,
    },
    {
      label: "Moje registrácie",
      icon: "ph:books",
      disabled: true,
    },
    {
      label: "Moje výsledky",
      icon: "ph:scroll",
      disabled: true,
    },
  ],
  [
    {
      label: "Panel správy",
      icon: "ph:nut",
    },
  ],
  [
    {
      label: "Odhlásiť sa",
      icon: "ph:plugs",
      onSelect: () => logout(),
    },
  ],
]);
</script>

<template>
  <UDashboardSearchButton
    :disabled="!userStore.isAuthenticated"
    class="lg:hidden"
    collapsed
    icon="ph:magnifying-glass" />
  <UFieldGroup v-if="userStore.isAuthenticated">
    <UButton
      to="/profile"
      color="neutral"
      variant="outline"
      :avatar="{
        src: `${userStore.user?.image}`,
        alt: `${userStore.user?.name}`,
      }">
      {{ userStore.user?.name }}
    </UButton>
    <UDropdownMenu
      :items="navItems"
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8,
      }">
      <UButton icon="ph:sort-ascending" color="neutral" variant="outline" />
    </UDropdownMenu>
  </UFieldGroup>
  <UButton
    v-else
    to="/auth"
    icon="ph:keyhole"
    color="neutral"
    variant="outline">
    Prihlásiť sa
  </UButton>
</template>

<style scoped></style>
