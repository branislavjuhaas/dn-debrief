<script setup lang="ts">
import AppLogo from "~/components/header/AppLogo.vue";
import AppNav from "~/components/header/AppNav.vue";

const userStore = useUserStore();
</script>

<template>
  <UHeader :toggle="false">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="h-12" />
      </NuxtLink>
    </template>
    <UDashboardSearchButton
      :disabled="!userStore.isAuthenticated"
      icon="ph:magnifying-glass"
      class="w-96">
      {{
        userStore.isAuthenticated
          ? "Hľadať ľudí, podujatia a kluby..."
          : "Pre vyhľadávanie sa prihláste"
      }}
    </UDashboardSearchButton>
    <template #right>
      <AppNav />
    </template>
  </UHeader>
</template>

<style scoped></style>
