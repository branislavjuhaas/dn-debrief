<script setup lang="ts">
const userStore = useUserStore();
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2">
        <DebriefLogo />
      </NuxtLink>
    </template>
    <UDashboardSearchButton
      class="w-96"
      :disabled="!userStore.isAuthenticated"
      icon="ph:magnifying-glass">
      {{
        userStore.isAuthenticated
          ? "Hľadať ľudí, podujatia a kluby..."
          : "Pre vyhľadávanie sa prihláste"
      }}
    </UDashboardSearchButton>
    <template #right>
      <UDashboardSearchButton
        :disabled="!userStore.isAuthenticated"
        class="lg:hidden"
        collapsed
        icon="ph:magnifying-glass" />
      <HeaderNav />
    </template>
  </UHeader>
</template>

<style scoped></style>
