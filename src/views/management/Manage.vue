<script setup>
import { useUserStore } from "../../stores.js";
import { translateRole } from "../../translate.js";

const userStore = useUserStore();

const links = [
  {
    name: "Správa používateľov",
    link: "/manage/users",
    roles: ["developer", "admin", "cap"],
  },
  {
    name: "Správa debatných klubov",
    link: "/manage/clubs",
    roles: ["developer", "admin"],
  },
  {
    name: `Správa debatného klubu ${userStore.club.name}`,
    link: `/manage/clubs/${userStore.club.id}`,
    roles: ["coach"],
  },
  {
    name: "Presmerovanie na stránku",
    link: "/manage/route",
    roles: ["developer"],
  },
];

const relevantLinks = links.filter((link) =>
  link.roles.includes(userStore.role),
);
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      Panel správy - {{ translateRole(userStore.role) }}
    </h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <router-link
          v-for="(link, index) in relevantLinks"
          :key="link.link"
          :to="link.link"
          :class="
            index === relevantLinks.length - 1 && relevantLinks.length % 2 !== 0
              ? 'col-span-1 sm:col-span-2'
              : ''
          "
          class="flex flex-row justify-center h-12 px-5 items-center border-2 border-black rounded-[1.25rem] text-black vertical-center cursor-pointer hover:border-red">
          <p class="font-bold">{{ link.name }}</p>
        </router-link>
      </div>
      <p class="text-red font-bold text-center">
        {{
          relevantLinks.length === 0
            ? "Nemáte prístup k žiadnym nástrojom správy."
            : "Ďakujeme za nadštandardnú prácu pre SDA!"
        }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
