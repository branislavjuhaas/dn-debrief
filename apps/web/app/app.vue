<script setup lang="ts">
import { sk } from "#ui/locale";
import Header from "~/components/Header.vue";
import Footer from "~/components/Footer.vue";
</script>

<template>
  <UApp :locale="sk">
    <NuxtRouteAnnouncer />
    <NuxtAnnouncer />
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <Header />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Footer />
  </UApp>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.15s ease-out,
    transform 0.15s cubic-bezier(0.25, 1, 0.5, 1);
}

.page-enter-from {
  opacity: 0;
  transform: scale(0.99);
}

.page-leave-to {
  opacity: 0;
  transform: scale(1.01);
}
</style>
