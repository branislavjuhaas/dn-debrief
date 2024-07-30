<script setup>
import { useUserStore } from "../stores.js";
const user = useUserStore();
</script>

<template>
  <div
    class="grid grid-cols-[auto_1fr] gap-3 w-full h-10 border-2 rounded-[1.25rem] px-4 items-center">
    <img src="../assets/icons/search.svg" alt="search" class="h-5" />
    <input
      :disabled="user.uid == null"
      type="text"
      placeholder="Hľadať podujatia, tímy, kluby"
      class="w-full outline-none bg-transparent placeholder-black mt-1 h-auto disabled:placeholder-grey" />
  </div>
</template>

<style scoped></style>
