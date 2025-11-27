<template>
  <UApp :locale="sk" :ui="{ colorScheme: 'light' }">
    <NuxtRouteAnnouncer />
    <AppHeader />
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppFooter />
  </UApp>
</template>
<script setup lang="ts">
import { sk } from "@nuxt/ui/locale";

import AppHeader from "~/components/header/AppHeader.vue";
import AppFooter from "~/components/footer/AppFooter.vue";
</script>
