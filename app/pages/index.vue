<script setup lang="ts">
useSeoMeta({
  title: "Domov",
});

const userStore = useUserStore();
</script>

<template>
  <UPageSection>
    <ProseH1>{{ useGreeting(userStore.user) }}</ProseH1>
  </UPageSection>
</template>

<style scoped></style>
