<script setup lang="ts">
const userStore = useUserStore();
</script>

<template>
  <UPageBody>
    <ProseH1>{{ useGreeting(userStore.user) }}</ProseH1>
  </UPageBody>
</template>

<style scoped></style>
