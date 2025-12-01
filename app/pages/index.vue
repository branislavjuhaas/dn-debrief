<script setup lang="ts">
useSeoMeta({
  title: "Domov",
});

const userStore = useUserStore();
</script>

<template>
  <UPageBody>
    <ProseH1>{{ useGreeting(userStore.user) }}</ProseH1>
  </UPageBody>
</template>

<style scoped></style>
