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

const NuxtLink = resolveComponent("NuxtLink");
</script>

<template>
  <UPage>
    <UPageHeader :title="greet(userData?.user ?? null)" />
    <UPageBody>
      <div class="space-y-2">
        <IconHeading icon="i-ph-newspaper-clipping-fill">
          Najrelevantnejšie udalosti
        </IconHeading>
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
        <IconHeading icon="i-ph-megaphone-fill">Pre vás</IconHeading>
        <ClientOnly>
          <ul role="list" class="flex flex-col gap-3 w-full py-1 px-0.5">
            <motion.li
              v-for="(item, index) in feed"
              :key="item.title"
              :initial="{ y: 10, opacity: 0 }"
              :animate="{ y: 0, opacity: 1 }"
              :transition="{
                duration: 0.35,
                ease: 'easeOut',
                delay: Math.min(index * 0.04, 0.3),
              }">
              <component
                :is="item.to ? NuxtLink : 'div'"
                :to="item.to"
                :class="[
                  'block rounded-lg px-6 py-3 bg-default ring ring-default drop-shadow overflow-hidden transition-all duration-200',
                  item.to
                    ? 'hover:ring-muted/50 cursor-pointer'
                    : 'cursor-default',
                ]">
                <h3 class="text-sm font-bold text-foreground">
                  {{ item.title }}
                </h3>
                <p
                  v-if="item.content"
                  class="text-sm text-muted mt-0.5 leading-relaxed">
                  {{ item.content }}
                </p>
              </component>
            </motion.li>
          </ul>
        </ClientOnly>
      </div>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
