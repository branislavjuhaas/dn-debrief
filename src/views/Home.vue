<script setup>
import { ref, watch } from "vue";
import { useUserStore } from "../stores.js";

const user = useUserStore();

// Function that will return Dobrý deň, if the user role is admin or developer and otherwise Ahoj. It can be called any time in the template.
const greeting = ref("Ahoj");

if (user.role === "admin" || user.role === "developer") {
  greeting.value = "Dobrý deň";
}

watch(
  () => user.role,
  () => {
    if (user.role === "admin" || user.role === "developer") {
      greeting.value = "Dobrý deň";
    }
  },
);
</script>

<template>
  <div>
    <h1 class="text-5xl font-bold">
      {{
        user.uid != null
          ? greeting + ", " + user.name + "!"
          : "Vitaj v systéme DebRIEF!"
      }}
    </h1>
  </div>
</template>

<style scoped></style>
