<script setup>
// Import the necessary Vue function
import { defineProps, onMounted } from "vue";

/**
 * Define the props for the component.
 * @type {Object} props - The props object.
 * @property {number} props.code - The error code.
 */
const props = defineProps(["code"]);

/**
 * The error message to be displayed.
 * @type {string}
 */
let message;

/**
 * The error description to be displayed.
 * @type {string}
 */
let description;

/**
 * This function sets the error message and description based on the error code.
 * If the error code is 401, it sets the message to "Neautorizovaný prístup" and the description to "Nemáte dostatočné oprávnenia na zobrazenie tejto stránky.".
 * If the error code is 404, it sets the message to "Stránka nenájdená" and the description to "Stránka, ktorú sa snažíte zobraziť, neexistuje.".
 * If the error code is 500, it sets the message to "Serverová chyba".
 * For any other error code, it sets the message to "Nastala chyba".
 */
switch (props.code) {
  case 127:
    message = "Neautorizovaný prístup";
    description =
      "Pre prístup musíte byť členom Vývojového programu DN Cascade.";
    break;
  case 401:
    message = "Neautorizovaný prístup";
    description = "Nemáte dostatočné oprávnenia na zobrazenie tejto stránky.";
    break;
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
