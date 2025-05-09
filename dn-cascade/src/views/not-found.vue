<route lang="json">
{
  "name": "not-found",
  "path": "/:pathMatch(.*)*",
  "meta": {
    "title": "Stránka nenájdená",
    "requiresAuth": false
  }
}
</route>

<script setup lang="ts">
import ErrorPage from "./components/ErrorPage.vue";
</script>

<template>
    <error-page code="404" />
</template>

<style scoped></style>
