<script setup>
const props = defineProps({
  title: {
    type: String,
    required: false,
    default: "",
  },
  message: {
    type: String,
    required: false,
    default: "",
  },
  buttons: {
    type: Array,
    required: false,
    default: () => [],
  },
});

let localTitle = "";
let localMessage = "";
let localButtons = [];

if (!props.message) {
  const urlParams = new URLSearchParams(window.location.search);
  localTitle = urlParams.get("title");
  localMessage = urlParams.get("message");
  localButtons = [
    { text: "Cancel", path: urlParams.get("cancel") },
    { text: "OK", path: urlParams.get("ok") },
  ];
} else {
  localTitle = props.title;
  localMessage = props.message;
  localButtons = props.buttons;
}
</script>

<template>
  <div class="gap-4">
    <h1>{{ localTitle }}</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="flex flex-col gap-4 text-black font-bold text-custom">
        <p>{{ localMessage }}</p>
      </div>
      <div
        class="grid gap-4 items-center sm:grid-rows-1 grid-cols-1 sm:grid-flow-col sm:grid-cols-none text-center">
        <router-link
          v-for="(button, idx) in localButtons"
          :key="button.text + '-' + idx"
          :to="button.path"
          class="form-secondary">
          {{ button.text }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-custom {
  text-align: justify;
  text-align-last: center;
}
</style>
