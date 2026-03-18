<script setup lang="ts">
import { sk } from '#ui/locale';
import Header from '~/components/Header.vue';
</script>

<template>
  <UApp :locale="sk">
    <NuxtRouteAnnouncer />
    <NuxtAnnouncer />
    <Header />
  </UApp>
</template>
