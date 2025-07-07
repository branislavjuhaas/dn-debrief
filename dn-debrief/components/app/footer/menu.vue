<template>
  <div>
    <DropdownMenuRoot v-model:open="toggleState" :modal="false">
      <DropdownMenuTrigger
        class="flex-row px-5 border-2 h-10 items-center rounded-r-2xl hover:bg-red hover:text-white text-black border-black cursor-pointer transition-colors duration-200 ease-in-out hidden sm:flex">
        <Icon name="ph:sort-descending" />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          class="flex flex-col border-2 border-black bg-white text-black rounded-2xl px-5 pt-4 pb-3 shadow-dialog will-change-[opacity,transform] gap-2 animate-slide-up z-50"
          :side-offset="5"
          align="end">
          <template
            v-for="item in filteredNavigationItems.filter(
              (i) => !i.drawerOnly,
            )">
            <DropdownMenuSeparator
              v-if="item.separator"
              :class="item.class"
              class="h-[1px] bg-black rounded-full" />
            <DropdownMenuItem v-else :class="item.class">
              <NuxtLink
                :to="item.to"
                class="flex flex-row items-center gap-2 hover:text-red">
                <Icon :name="item.icon || 'ph:question'" />
                <p class="mt-1">
                  {{ item.title }}
                </p>
              </NuxtLink>
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
    <DrawerRoot>
      <DrawerTrigger
        class="flex flex-row px-5 border-2 h-10 items-center rounded-r-2xl hover:bg-red hover:text-white text-black border-black cursor-pointer transition-colors duration-200 ease-in-out w-fit sm:hidden">
        <Icon name="ph:sort-descending" />
      </DrawerTrigger>
      <ClientOnly>
        <DrawerPortal>
          <DrawerOverlay
            class="w-full h-full fixed top-0 left-0 bg-black/30 backdrop-blur-[2px]" />
          <DrawerContent
            class="fixed z-50 bottom-0 left-0 w-full flex flex-col border-t-2 border-black bg-white text-black px-5 py-4 shadow-dialog will-change-[opacity,transform]">
            <div role="menu" class="flex flex-col gap-2">
              <template v-for="item in filteredNavigationItems">
                <NuxtLink
                  v-if="!item.separator"
                  :class="item.class"
                  role="menuitem"
                  :to="item.to"
                  class="flex flex-row items-center gap-2 hover:text-red">
                  <Icon :name="item.icon || 'ph:question'" />
                  <p class="mt-1">
                    {{ item.title }}
                  </p>
                </NuxtLink>
                <div
                  v-else
                  role="separator"
                  aria-orientation="horizontal"
                  :class="item.class"
                  class="h-[1px] bg-black rounded-full" />
              </template>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </ClientOnly>
    </DrawerRoot>
  </div>
</template>

<script setup lang="ts">
import {
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTrigger,
} from "vaul-vue";

const toggleState = ref(false);

const userStore = {
  isAuthenticated: true, // Example authentication state
  fullName: "Branislav Juhás",
  role: "admin", // Example role, can be 'admin', 'user', etc.
  clubId: "12345", // Example club ID
};

const navigationItems = [
  {
    title: "Môj profil",
    icon: "ph:smiley-sticker",
    to: "/profile",
  },
  {
    title: "Môj klub",
    icon: "ph:bank",
    to: `/clubs/${userStore.clubId}`,
    filter: () => {
      return userStore.clubId;
    },
  },
  {
    title: "Podujatia",
    icon: "ph:globe-hemisphere-west",
    to: "/events",
  },
  {
    separator: true,
    class: "hidden sm:flex",
    filter: () => {
      return userStore.role && userStore.role !== "user";
    },
  },
  {
    separator: true,
    class: "sm:hidden",
  },
  {
    title: "Panel správy",
    icon: "ph:nut",
    to: "/management",
    filter: () => {
      return userStore.role && userStore.role !== "user";
    },
  },
  {
    title: "Vyhlásenie GDPR",
    to: "/privacy",
    icon: "ph:fingerprint-simple",
    drawerOnly: true,
  },
  {
    separator: true,
  },
  {
    title: "Odhlásiť sa",
    icon: "ph:plugs",
    to: "/auth/logout",
  },
];

const filteredNavigationItems = computed(() => {
  return navigationItems.filter((item) => {
    if (item.filter) {
      return item.filter();
    }
    return true;
  });
});
</script>

<style scoped></style>
