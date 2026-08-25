<script setup lang="ts">
import { sk } from "#ui/locale";
import Header from "~/components/Header.vue";
import Footer from "~/components/Footer.vue";

import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const displayError = computed(() => {
  if (!props.error) return { status: 500, message: "Nastala neznáma chyba" };

  const { status, message } = props.error;
  return {
    code: status,
    message: message
      ? message.startsWith("Page not found")
        ? "Stránka, ktorú hľadáte, neexistuje alebo bola premiestnená."
        : message
      : "Vyskytla sa neznáma chyba. Na jej odstránení pracujeme. Skúste to prosím neskôr.",
    statusMessage:
      status === 404
        ? "Tu argumenty nestačia!"
        : "O tomto radšej nebudeme debatovať!",
  };
});
</script>

<template>
  <UApp :locale="sk">
    <NuxtRouteAnnouncer />
    <NuxtAnnouncer />
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <Banners />
    <Header />
    <UError :error="displayError" />
    <Footer />
  </UApp>
</template>
