<script setup>
// Import the defineProps function from Vue.
const props = defineProps(["code"]);

/**
 * Function to map error codes to their corresponding error messages.
 *
 * @param {number} code - The error code.
 * @returns {string} - The corresponding error message.
 */
function getErrorMessages(code) {
  const messages = {
    400: "Požiadavka je nesprávne formulovaná",
    401: "Na túto akciu nemáte oprávnenie",
    403: "Na túto akciu nemáte oprávnenie",
    404: "Vami vyžiadaný obsah neexistuje",
    405: "Zvolená metóda nie je povolená",
    408: "Časový limit pre požiadavku vypršal",
    500: "Pri plnení požiadavky nastala serverová chyba",
  };
  return (
    messages[code] || "Pri spracovaní vašej požiadavky nastala neznáma chyba"
  );
}

// Get the error message for the given error code.
const errorMessage = getErrorMessages(props.code);
</script>

<template>
  <div>
    <h1>Chyba {{ props.code }}</h1>
    <h4>{{ errorMessage }}</h4>
  </div>
</template>

<style scoped></style>
