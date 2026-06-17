<script setup lang="ts">
import type { User } from "#shared/types/user";

const userStore = useUserStore();

const greet = (user: User | null) => {
  if (!user) {
    return "Vitajte v systéme DebRIEF!";
  }

  if (user.role === "developer") {
    return `Krásny deň, ${user.name}!`;
  }

  if (user.role !== "user") {
    return `Nazdar, ${user.name}!`;
  }

  const hours = new Date().getHours();
  const salute =
    hours < 10 ? "Dobré ráno" : hours >= 18 ? "Dobrý večer" : "Dobrý deň";

  return `${salute}, ${user.name}!`;
};
</script>

<template>
  <UPage>
    <UPageHeader :title="greet(userStore.user)" />
    <UPageBody>
      <div class="space-y-2">
        <IconHeading icon="ph:newspaper-clipping-fill"
          >Najrelevantnejšie udalosti</IconHeading
        >
        <div
          class="flex flex-row gap-4 w-full py-1 px-0.5 overflow-x-scroll no-scrollbar"></div>
      </div>
      <div class="space-y-2">
        <IconHeading icon="ph:megaphone-fill">Pre vás</IconHeading>
        <div class="flex flex-col gap-4 w-full py-1 px-0.5"></div>
      </div>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
