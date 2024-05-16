<script setup>
import { getAuth } from "firebase/auth";
import { useUserStore } from "../stores/stores.js";

const auth = getAuth();
const userStore = useUserStore();

const signOut = () => {
  console.log("Signing out");
  auth.signOut().then(() => {
    userStore.logOut();
    console.log("User signed out");
  });
};
</script>

<template>
  <div>
    <h1>User</h1>
    <button @click="signOut">Sign out</button>
  </div>
</template>

<style scoped></style>
