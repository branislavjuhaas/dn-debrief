<script setup lang="ts">
import { motion } from "motion-v";
import type { User, UserRole } from "#shared/types/user";

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

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

const feed = useFeed();
</script>

<template>
  <UPage>
    <UPageHeader :title="greet(userData?.user ?? null)" />
    <UPageBody>
      <div class="space-y-2">
        <IconHeading icon="ph:newspaper-clipping-fill"
          >Najrelevantnejšie udalosti</IconHeading
        >
        <UEmpty
          title="Žiadne dostupné podujatia"
          description="Momentálne nie sú k dispozícii žiadne podujatia na zobrazenie."
          :actions="
            ['developer', 'admin', 'organizer', 'junior-organizer'].includes(
              userData?.user?.role ?? 'user',
            )
              ? [
                  {
                    icon: 'i-ph-plus',
                    label: 'Vytvoriť podujatie',
                    color: 'primary',
                    variant: 'subtle',
                    to: '/manage/events/new',
                  },
                ]
              : undefined
          "
          :ui="{ header: 'max-w-lg' }" />
        <!-- <div
          class="flex flex-row gap-4 w-full py-1 px-0.5 overflow-x-scroll no-scrollbar"></div> -->
      </div>
      <div class="space-y-2">
        <IconHeading icon="ph:megaphone-fill">Pre vás</IconHeading>
        <div class="flex flex-col gap-3 w-full py-1 px-0.5">
          <motion.div
            v-for="(item, index) in feed"
            :key="item.title"
            :transition="{
              duration: 0.4,
              ease: 'easeOut',
              delay: index * 0.05,
            }"
            :initial="{ translateY: 10, opacity: 0 }"
            :animate="{ translateY: 0, opacity: 1 }"
            class="px-6 py-3 rounded-lg overflow-hidden drop-shadow bg-default ring ring-default">
            <h3 class="text-sm font-bold">{{ item.title }}</h3>
            <div class="text-sm text-muted">{{ item.content }}</div>
          </motion.div>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
