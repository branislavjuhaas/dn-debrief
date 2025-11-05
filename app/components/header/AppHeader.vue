<script setup lang="ts">
import AppLogo from "~/components/header/AppLogo.vue";
</script>

<template>
  <UHeader :toggle="false">
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="h-12" />
      </NuxtLink>
    </template>
  </UHeader>
</template>

<style scoped></style>
