<script setup lang="ts">
const userStore = useUserStore();
</script>

<template>
  <UDashboardSearchButton
    :disabled="!userStore.isAuthenticated"
    class="lg:hidden"
    collapsed
    icon="ph:magnifying-glass" />
  <UFieldGroup v-if="userStore.isAuthenticated">
    <UButton
      to="/profile"
      color="neutral"
      variant="outline"
      :avatar="{
        src: `${userStore.user?.image}`,
        alt: `${userStore.user?.name}`,
      }">
      {{ userStore.user?.name }}
    </UButton>
  </UFieldGroup>
  <UButton
    v-else
    to="/auth"
    icon="ph:keyhole"
    color="neutral"
    variant="outline">
    Prihlásiť sa
  </UButton>
</template>

<style scoped></style>
