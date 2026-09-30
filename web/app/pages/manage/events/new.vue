<script setup lang="ts">
definePageMeta({
  layout: "manage",
  middleware: ["auth"],
  allowedRoles: [
    "developer",
    "admin",
    "chief_adjudicator",
    "organizer",
    "junior_organizer",
  ],
});

useSeoMeta({
  title: "Tvorba podujatia",
  description: "Vytvorenie nového turnaja, seminára alebo iného podujatia.",
});
</script>

<template>
  <EventForm mode="create" />
</template>
