<script setup lang="ts">
const userStore = useUserStore();

const client = useSupabaseClient();
</script>

<template>
  <app-layout :title="`Welcome ${userStore.fullName ?? 'Guest'}`">
    <form-button link="/auth">Login</form-button>
    <form-button link="/auth/logout">Logout</form-button>
    <UButton to="/auth/register">Register</UButton>
  </app-layout>
</template>

<style scoped></style>
