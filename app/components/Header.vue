<script setup lang="ts">
const userStore = useUserStore();
</script>

<template>
  <UHeader>
    <template #left>
      <DebriefLogo />
    </template>
    <UDashboardSearchButton
      class="w-96"
      :disabled="!userStore.isAuthenticated"
      icon="ph:magnifying-glass"
      @click="searchOpen = true">
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
