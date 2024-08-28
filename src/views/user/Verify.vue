<script setup>
// Import necessary components and functions
import { ref } from "vue";
import router from "../../router.js";

// Define a reactive variable for the message
const message = ref(
  "Tvoju registráciu práve potvrdzujeme. Ďakujeme za trpezlivosť.",
);

// Get the token from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

/**
 * This function takes a token and reverts it back to the original userId and year.
 * The token is assumed to be a string where each character's ASCII value has been incremented by 1,
 * and the string has been reversed. The last 4 characters of the reversed string represent the year.
 *
 * @param {string} token - The token to be reverted.
 * @returns {Object} An object containing the userId and year extracted from the token.
 * @remarks This function is designed to work until the year 10000. Beyond that, the year extraction logic may not work as expected.
 */
const userIdFromToken = (token) => {
  // Split the token into an array of characters
  const reverted = token
    .split("")
    // Convert each character to its ASCII value, decrement by 1, and convert back to character
    .map((char) => {
      let prevChar;
      // Handle edge cases where the character is 'a', '0', or 'A'
      if (char === "a") {
        prevChar = "Z".charCodeAt(0);
      } else if (char === "0") {
        prevChar = "z".charCodeAt(0);
      } else if (char === "A") {
        prevChar = "9".charCodeAt(0);
      } else {
        prevChar = char.charCodeAt(0) - 1;
      }
      return String.fromCharCode(prevChar);
    })
    // Reverse the array
    .reverse()
    // Join the array back into a string
    .join("");

  // Extract the last 4 characters as year
  const year = reverted.slice(-4);
  // Extract the rest of the string as userId
  const userId = reverted.slice(0, -4);

  // Return an object with userId and year as properties
  return { userId, year };
};

/**
 * This function sends a token for verification to the Firebase function 'updateUserSeasons'.
 * It first imports the necessary Firebase functions and connects to the local Firebase emulator.
 * Then, it gets a reference to the 'updateUserSeasons' function and calls it with the provided token.
 * The result of the function call is returned, or an error is caught and returned.
 *
 * @param {string} token - The token to be verified.
 * @returns {Promise} A promise that resolves with the result of the Firebase function call, or an error.
 */
const sendTokenVerification = async (token) => {
  // Dynamically import the necessary Firebase functions
  const { httpsCallable } = await import("firebase/functions");
  const { functions } = await import("../../main.js");

  // Get a reference to the updateUserSeasons function
  const updateUserSeasons = httpsCallable(functions, "updateUserSeasons");

  // Call the function with the required data
  return updateUserSeasons({ userId: token })
    .then((result) => {
      // Read result of the Cloud Function.
      return result.data;
    })
    .catch((error) => {
      // Return the error
      return error;
    });
};

/**
 * Checks if the token is valid and if so, sends it for verification.
 * If the token is invalid or the verification fails, it sets an error message and redirects to the home page.
 * If the verification is successful, it sets a success message.
 *
 * @param {string} token - The token to be verified.
 * @param {Object} router - The Vue router instance.
 * @param {Object} message - A Vue ref object to hold the message to be displayed.
 */
const handleTokenVerification = async (token, router, message) => {
  // If no token is provided, set an error message and redirect to the home page
  if (!token) {
    message.value = "Chyba: Neplatný token.";
    console.error("No token provided.");
    setTimeout(() => {
      router.push("/");
    }, 3000);
    return;
  }

  const { userId, year } = userIdFromToken(token);
  console.log(userId, year);

  // If the year is not the current year, the token is invalid or expired
  if (year.toString() !== new Date().getFullYear().toString()) {
    message.value = "Chyba: Neplatný token.";
    console.error("Invalid or expired token.");
    setTimeout(() => {
      router.push("/");
    }, 3000);
    return;
  }

  const result = await sendTokenVerification(userId);

  // If the result is an error, display an error message and redirect to the home page
  // If the result is successful ({ success: true }), display a success message and redirect to the home page
  if (result.success) {
    message.value = "Tvoja registrácia bola úspešne potvrdená!";
    setTimeout(() => {
      router.push("/");
    }, 3000);
  } else {
    message.value = "Chyba: Neplatný token.";
    console.error("Invalid token. from function", result);
    setTimeout(() => {
      router.push("/");
    }, 3000);
  }
};

// Call the function with the token, router, and message
handleTokenVerification(token, router, message);
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Potvrdenie registrácie do SDA</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <p
        class="flex h-12 px-5 items-center justify-center text-red font-bold vertical-center col-span-full">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
