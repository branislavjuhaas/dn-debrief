<script setup lang="ts">
import { sk } from "#ui/locale";
import Header from "~/components/Header.vue";
import Footer from "~/components/Footer.vue";
</script>

<template>
  <UApp :locale="sk">
    <NuxtRouteAnnouncer />
    <NuxtAnnouncer />
    <Header />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Footer />
  </UApp>
</template>
