<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { User } from "#shared/types/user";

const authClient = useAuthClient();

const { data: sessionData } = await useAsyncData("auth-session", () =>
  authClient.getSession({
    fetchOptions: {
      headers: useRequestHeaders(["cookie"]) as Record<string, string>,
    },
  }),
);

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const logout = async () => {
  await navigateTo("/");
  await authClient.signOut();
  await clearNuxtData("users-me");
};

const navItems = computed<DropdownMenuItem[][]>(() => {
  const user = userData?.value?.user as User | null;

  return [
    [
      {
        label: "Môj profil",
        icon: "i-ph-identification-card",
        to: "/profile",
      },
      {
        label: "Moje platby",
        icon: "i-ph-coins",
        disabled: true,
      },
      {
        label: "Moje registrácie",
        icon: "i-ph-books",
        disabled: true,
      },
      {
        label: "Moje výsledky",
        icon: "i-ph-scroll",
        disabled: true,
      },
    ],
    ...(user && (user.role !== "user" || (user.managedClubs?.length ?? 0) > 0)
      ? [
          [
            {
              label: "Panel správy",
              to: "/manage",
              icon: "i-ph-nut",
            },
          ],
        ]
      : []),
    [
      {
        label: "Odhlásiť sa",
        icon: "i-ph-plugs",
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
          chip: sessionData?.data?.session.impersonatedBy
            ? {
                color: 'info',
                position: 'bottom-right',
                size: 'md',
              }
            : false,
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
          icon="i-ph-sort-ascending"
          color="neutral"
          variant="outline"
          aria-label="Otvoriť menu" />
      </UDropdownMenu>
    </UFieldGroup>
  </template>
  <UButton
    v-else
    to="/auth"
    color="neutral"
    variant="subtle"
    icon="i-ph-keyhole">
    Prihlásenie
  </UButton>
</template>

<style scoped></style>
