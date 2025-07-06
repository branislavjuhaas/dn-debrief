<template>
  <DropdownMenuRoot v-model:open="toggleState" class="w-fit" :modal="false">
    <DropdownMenuTrigger
      class="flex flex-row px-5 border-2 h-10 items-center rounded-r-2xl hover:bg-red hover:text-white text-black border-black cursor-pointer transition-colors duration-200 ease-in-out"
    >
      <Icon name="ph:sort-descending" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        class="flex flex-col border-2 border-black bg-white text-black rounded-2xl px-5 pt-4 pb-3 shadow-dialog will-change-[opacity,transform] gap-2 animate-slide-up"
        :side-offset="5"
        align="end"
      >
        <template v-for="item in filteredNavigationItems">
          <DropdownMenuSeparator
            v-if="item.separator"
            :class="item.class"
            class="h-[1px] bg-black rounded-full"
          />
          <DropdownMenuItem v-else :class="item.class">
            <NuxtLink
              :to="item.to"
              class="flex flex-row items-center gap-2 hover:text-red"
            >
              <Icon :name="item.icon || 'ph:question'" />
              <p :to="item.to" class="mt-1">
                {{ item.title }}
              </p></NuxtLink
            >
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script setup lang="ts">
const toggleState = ref(false);

const userStore = {
  isAuthenticated: true, // Example authentication state
  fullName: "Branislav Juhás",
  role: "user", // Example role, can be 'admin', 'user', etc.
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
    class: "flex sm:hidden",
    filter: () => {
      return userStore.role && userStore.role !== "user";
    },
  },
  {
    separator: true,
    class: "hidden sm:flex",
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
    class: "hidden sm:flex",
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
