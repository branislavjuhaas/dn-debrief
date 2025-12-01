<template>
  <UApp :locale="sk" :ui="{ colorScheme: 'light' }">
    <NuxtRouteAnnouncer />
    <UBanner v-if="userStore.impersonation" icon="ph:visor-bold" color="info">
      <template #title>
        <p>
          <b>Ja je niekto iný</b>
          | Dočasne zosobňujete používateľa {{ userStore.fullName }}.
        </p>
      </template>
    </UBanner>
    <AppHeader />
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
    <AppFooter />
  </UApp>
</template>
<script setup lang="ts">
import { sk } from "@nuxt/ui/locale";

import AppHeader from "~/components/header/AppHeader.vue";
import AppFooter from "~/components/footer/AppFooter.vue";

const userStore = useUserStore();
</script>
