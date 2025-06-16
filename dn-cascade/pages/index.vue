<script setup lang="ts">
const userStore = useUserStore();

const client = useSupabaseClient();

const allUsers = await client.from("users").select("*, details(*), claims(*)");
</script>

<template>
  <app-layout :title="`Welcome ${userStore.fullName ?? 'Guest'}`">
    <form-button link="/auth">Login</form-button>
    <form-button link="/auth/logout">Logout</form-button>
    <p>{{ allUsers }}</p>
  </app-layout>
</template>

<style scoped></style>
