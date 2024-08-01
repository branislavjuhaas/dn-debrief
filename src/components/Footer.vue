<script setup>
import { ref } from "vue";
import { useUserStore } from "../stores.js";

const user = useUserStore();

const date =
  new Date().getDate().toString() +
  "/" +
  (new Date().getMonth() + 1).toString();

let isDebrief = true;

if (
  window.location.hostname !== "debrief.sda.sk" ||
  date !== "23/1" ||
  date !== "10/3" ||
  date !== "28/6" ||
  date !== "17/11"
) {
  isDebrief = false;
}
</script>

<template>
  <div class="flex flex-col h-[3.75rem] items-center justify-center px-5">
    <div
      class="flex flex-row justify-between items-center max-w-[1320px] h-full w-full">
      <p class="hidden mt-1 sm:flex">
        {{
          isDebrief
            ? "2024 Slovenská debatná asociácia"
            : "2024 Branislav Juhás"
        }}
      </p>

      <div class="flex flex-row gap-14 items-center w-full sm:w-auto">
        <a href="https://sda.sk" class="hidden mt-1 sm:flex">Viac o SDA</a>
        <router-link
          :to="user.uid != null ? '/profile' : '/auth'"
          class="flex min-w-40 px-5 h-10 border-2 border-black rounded-[1.25rem] items-center justify-center duration-150 w-full sm:w-auto hover:bg-red hover:text-white vertical-center">
          <p>
            {{ user.uid != null ? user.fullName : "Prihlásiť" }}
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
