<script setup lang="ts">
const userStore = useUserStore();
const searchOpen = ref(false);
</script>

<template>
  <UHeader :toggle="false">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="h-12" />
      </NuxtLink>
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

    <AppSearch v-model:open="searchOpen" />
    <template #right>
      <AppNav v-model:open="searchOpen" />
    </template>
  </UHeader>
</template>

<style scoped></style>
