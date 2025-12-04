<script setup lang="ts">
import AppHeader from "~/components/header/AppHeader.vue";
import AppFooter from "~/components/footer/AppFooter.vue";
import type { NuxtError } from "#app";

const slovakErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 404:
      return "Stránka nenájdená";
    case 500:
      return "Interná chyba servera";
    default:
      return "Nastala chyba";
  }
};

const slovakErrorDescription = (statusCode: number) => {
  switch (statusCode) {
    case 404:
      return "Stránka, ktorú hľadáte, nebola nájdená.";
    case 500:
      return "Došlo k internej chybe servera. Skúste to prosím neskôr.";
    default:
      return "Nastala chyba pri spracovaní vašej požiadavky.";
  }
};

const { error } = defineProps<{ error: NuxtError }>();

useSeoMeta({
  title: slovakErrorMessage(error.statusCode),
  description: slovakErrorDescription(error.statusCode),
});

console.error("Nuxt Error:", error);
</script>

<template>
  <UApp>
    <AppHeader />

    <UError
      :clear="{
        label: 'Späť na domovskú stránku',
      }"
      :error="{
        ...error,
        statusMessage: slovakErrorMessage(error.statusCode),
        message: slovakErrorDescription(error.statusCode),
      }" />

    <AppFooter />
  </UApp>
</template>

<style scoped></style>
