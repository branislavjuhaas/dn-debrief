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
          class="flex flex-row gap-4 w-full py-1 px-0.5 overflow-x-scroll no-scrollbar">
          <EventCard
            name="Začiatočnícky turnaj 2025"
            slug="sn251"
            thumbnail="https://picsum.photos/700/300"
            place="Žilina"
            :beginning="new Date('2025-11-07')"
            :end="new Date('2025-11-08')"
            :badges="[{ text: 'Práve prebieha', color: 'success' }]" />
          <EventCard
            name="1. turnaj 2. kategórie JDL"
            slug="zi251"
            thumbnail="https://picsum.photos/701/300"
            place="Martin"
            :beginning="new Date('2025-11-15')"
            :end="new Date('2025-11-15')"
            :badges="[
              { text: 'ZDP', color: 'info', variant: 'outline' },
              { text: 'Registrácia uzavretá', color: 'error' },
            ]" />
          <EventCard
            name="XXVI. Finále Slovenskej debatnej ligy 2024/2025"
            slug="fsdl25"
            thumbnail="https://picsum.photos/702/300"
            place="Žilina"
            :beginning="new Date('2025-11-07')"
            :end="new Date('2025-11-08')"
            :badges="[{ text: 'Registrácia otvorená', color: 'success' }]" />
          <EventCard
            name="Valné zhromaždenie 2026"
            slug="vz261"
            thumbnail="https://picsum.photos/703/300"
            place="Žilina"
            :beginning="new Date('2026-09-06')"
            :end="new Date('2026-09-09')" />
        </div>
      </div>
      <div class="space-y-2">
        <IconHeading icon="ph:megaphone-fill">Pre vás</IconHeading>
        <div class="flex flex-col gap-4 w-full py-1 px-0.5"></div>
      </div>
    </UPageBody>
  </UPage>
</template>

<style scoped></style>
