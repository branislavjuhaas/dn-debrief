<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const userStore = useUserStore();
const authClient = useAuthClient();

const logout = async () => {
  authClient.signOut();
  userStore.$reset();
};

const navItems = ref<DropdownMenuItem[][]>([
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
  ...(userStore.isAuthenticated &&
  (userStore.user?.role !== "user" ||
    (userStore.user?.managedClubs?.length ?? 0) > 0)
    ? [
        [
          {
            label: "Panel správy",
            to: "/manage",
            icon: "ph:nut",
          },
        ],
      ]
    : []),
  [
    {
      label: "Odhlásiť sa",
      icon: "ph:plugs",
      color: "error",
      onSelect: () => logout(),
    },
  ],
]);
</script>

<template>
  <template v-if="userStore.isAuthenticated">
    <UFieldGroup>
      <UButton
        to="/profile"
        color="neutral"
        variant="outline"
        :avatar="{
          src: `${userStore.user?.image}`,
          alt: 'Profile picture',
          chip: userStore.impersonated ? { color: 'info', inset: true } : false,
        }"
        aria-label="Používateľský profil">
        {{ userStore.fullName }}
      </UButton>
      <UDropdownMenu
        :items="navItems"
        :content="{
          align: 'end',
          side: 'bottom',
          sideOffset: 8,
        }">
        <UButton
          icon="ph:sort-ascending"
          color="neutral"
          variant="outline"
          aria-label="Otvoriť menu" />
      </UDropdownMenu>
    </UFieldGroup>
  </template>
  <UButton v-else to="/auth" color="neutral" variant="subtle" icon="ph:keyhole">
    Prihlásenie
  </UButton>
</template>

<style scoped></style>
