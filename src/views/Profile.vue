<script setup>
import { logout } from "../firebase/auth.js";
</script>

<template>
  <div>
    <h1 class="text-5xl font-bold">Profil</h1>
    <button @click="logout" class="btn">Odhlásiť sa</button>
  </div>
</template>

<style scoped></style>
