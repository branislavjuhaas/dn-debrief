<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { User } from "#shared/types/user";

const authClient = useAuthClient();
const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const logout = async () => {
  await authClient.signOut();
  await clearNuxtData("users-me");
  navigateTo("/");
};

const navItems = computed<DropdownMenuItem[][]>(() => {
  const user = userData?.value?.user as User | null;

  return [
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
    ...(user && (user.role !== "user" || (user.managedClubs?.length ?? 0) > 0)
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
  ];
});
</script>

<template>
  <template v-if="userData?.user">
    <UFieldGroup>
      <UButton
        to="/profile"
        color="neutral"
        variant="outline"
        :avatar="{
          src: userData.user.image ?? undefined,
          alt: `${userData.user.name} ${userData.user.surname}`,
          chip: false,
        }"
        aria-label="Používateľský profil">
        {{ userData.user.name }}
        {{ userData.user.surname }}
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
