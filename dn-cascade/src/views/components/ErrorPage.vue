<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  code: string;
}>();

/**
 * The error message to be displayed.
 * @type {string}
 */
let message = "";

/**
 * The error description to be displayed.
 * @type {string}
 */
let description = "";

/**
 * This function sets the error message and description based on the error code.
 */
switch (props.code) {
  case "127":
    message = "Neautorizovaný prístup";
    description =
      "Pre prístup musíte byť členom Vývojového programu DN Cascade.";
    break;
  case "401":
    message = "Neautorizovaný prístup";
    description = "Nemáte dostatočné oprávnenia na zobrazenie tejto stránky.";
    break;
  case "404":
    message = "Stránka nenájdená";
    description = "Stránka, ktorú sa snažíte zobraziť, neexistuje.";
    break;
  case "500":
    message = "Serverová chyba";
    break;
  default:
    message = "Nastala chyba";
}
</script>

<template>
  <div>
    <h1>
      <b>{{ props.code + " - " + message }}</b>
    </h1>
    <p class="text-xl mt-2">{{ description }}</p>
  </div>
</template>

<style scoped></style>