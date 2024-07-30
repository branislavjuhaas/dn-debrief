<script setup>
// get the error from the props
const props = defineProps(["code"]);

// set the error message based on the error code
let message;
let description;
switch (props.code) {
  case 404:
    message = "Stránka nenájdená";
    description = "Stránka, ktorú sa snažíte zobraziť, neexistuje.";
    break;
  case 500:
    message = "Serverová chyba";
    break;
  default:
    message = "Nastala chyba";
}
</script>

<template>
  <div>
    <h1 class="text-5xl">
      <b>{{ code + " - " + message }}</b>
    </h1>
    <p class="text-xl mt-2">{{ description }}</p>
  </div>
</template>

<style scoped></style>
