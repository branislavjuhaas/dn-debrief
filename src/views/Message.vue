<script setup>
// Get the props message and buttons. If there are no props, get the message from the query

import Field from "../components/Field.vue";
import Toggle from "../components/Toggle.vue";

const props = defineProps(["title", "message", "buttons"]);

let title = "";
let message = "";
let buttons = [];

if (!props.message) {
  const urlParams = new URLSearchParams(window.location.search);
  title = urlParams.get("title");
  message = urlParams.get("message");
  buttons = [
    { text: "Cancel", path: urlParams.get("cancel") },
    { text: "OK", path: urlParams.get("ok") },
  ];
} else {
  title = props.title;
  message = props.message;
  buttons = props.buttons;
}
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">{{ title }}</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="flex flex-col gap-4 text-black font-bold text-center">
        <p>{{ message }}</p>
      </div>
      <div
        class="grid gap-4 items-center sm:grid-rows-1 grid-cols-1 sm:grid-flow-col sm:grid-cols-none text-center">
        <router-link
          v-for="button in buttons"
          :to="button.path"
          class="form-secondary">
          {{ button.text }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
