<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { breakpointsTailwind } from "@vueuse/core";

const userStore = useUserStore();
const authClient = useAuthClient();

const breakpoints = useBreakpoints(breakpointsTailwind);
const mobile = breakpoints.smaller("lg");

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
          alt: `${userStore.fullName}`,
          chip: userStore.impersonated ? { color: 'info', inset: true } : false,
        }">
        {{ userStore.fullName }}
      </UButton>
      <UDrawer v-if="mobile" :handle="false" :ui="{ content: 'rounded-none' }">
        <UButton icon="ph:sort-ascending" color="neutral" variant="outline" />

        <template #body>
          <div class="flex flex-col gap-1 pb-4">
            <template v-for="(group, i) in navItems" :key="i">
              <USeparator v-if="i > 0" class="my-1" />
              <UButton
                v-for="item in group"
                :key="item.label"
                :label="item.label"
                :icon="item.icon"
                :disabled="item.disabled"
                :color="item.color ?? 'neutral'"
                variant="ghost"
                class="w-full justify-start rounded!"
                @click="
                  (event) => {
                    item.onSelect?.(event);
                  }
                " />
            </template>
          </div>
        </template>
      </UDrawer>
      <UDropdownMenu
        v-else
        :items="navItems"
        :content="{
          align: 'end',
          side: 'bottom',
          sideOffset: 8,
        }">
        <UButton icon="ph:sort-ascending" color="neutral" variant="outline" />
      </UDropdownMenu>
    </UFieldGroup>
  </template>
  <UButton v-else to="/auth" color="neutral" variant="subtle" icon="ph:keyhole">
    Prihlásenie
  </UButton>
</template>

<style scoped></style>
