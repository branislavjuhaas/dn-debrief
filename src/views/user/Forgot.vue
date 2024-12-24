<script setup>
// Import necessary components and functions
import Field from "../../components/Field.vue";
import { ref, watch } from "vue";
import { translateError } from "../../translate.js";
import { useLoadingStore } from "../../stores.js";

// Get the loading store
const loadingStore = useLoadingStore();

// Define resetCode as an argument oobCode if it exists and if mode argument is equal to resetPassword, otherwise null
let resetCode = null;

if (window.location.search.includes("oobCode")) {
  const urlParams = new URLSearchParams(window.location.search);
  resetCode = urlParams.get("oobCode");
}

// Define reactive variables for email, password, confirmation, message, and submit status
const email = ref(
  window.location.search.includes("email")
    ? window.location.search.split("email=")[1]
    : "",
);
const password = ref("");
const confirm = ref("");
const message = ref("");
const canSubmit = ref(false);

// If resetCode is not present and email value is not empty, enable submit
if (!resetCode && email.value !== "") {
  canSubmit.value = true;
}

/**
 * This asynchronous function resets the user's password.
 * It starts the loading indicator, imports the `resetPassword` function from the firebase auth module, and attempts to reset the password.
 * If an error occurs during the process, it translates the error message and sets it to the message variable.
 * Finally, it stops the loading indicator and redirects the user to the auth page.
 *
 * @async
 * @function resetPassword
 * @returns {Promise<void>} - A Promise that resolves when the password reset attempt has been made.
 */
const resetPassword = async () => {
  loadingStore.loadingStart();

  const { resetPassword } = await import("../../firebase/auth.js");

  resetPassword(resetCode, password.value)
    .catch((error) => {
      message.value = translateError(error.code);
      loadingStore.loadingEnd();
      throw error;
    })
    .then(() => {
      message.value = "Heslo bolo zmenené";

      setTimeout(() => {
        loadingStore.loadingEnd();
        window.location.href = "/auth";
      }, 3000);
    });
};

/**
 * This asynchronous function sends a password reset email.
 * It starts the loading indicator, imports the `sendResetEmail` function from the firebase auth module, and attempts to send the reset email.
 * If an error occurs during the process, it translates the error message and sets it to the message variable.
 * Finally, it stops the loading indicator and redirects the user to the home page.
 *
 * @async
 * @function sendReset
 * @returns {Promise<void>} - A Promise that resolves when the reset email has been sent.
 */
const sendReset = async () => {
  loadingStore.loadingStart();

  const { sendResetEmail } = await import("../../firebase/auth.js");

  sendResetEmail(email.value)
    .catch((error) => {
      message.value = translateError(error.code);
      throw error;
    })
    .then(() => {
      message.value = "Email bol odoslaný";

      setTimeout(() => {
        loadingStore.loadingEnd();
        window.location.href = "/";
      }, 3000);
    });
};

/**
 * This asynchronous function handles the reset process.
 * If resetCode is present, it calls the resetPassword function.
 * Otherwise, it calls the sendReset function.
 *
 * @async
 * @function handleReset
 * @returns {Promise<void>} - A Promise that resolves when the reset process has been handled.
 */
const handleReset = async () => {
  if (resetCode) {
    await resetPassword();
    return;
  }

  await sendReset();
};

// If resetCode is present, watch the password and confirm fields
if (resetCode !== null) {
  // Watch the password and confirm fields
  watch([password, confirm], ([password, confirm]) => {
    // If the length of the password is less than 6 characters, display a message
    if (password.length < 6) {
      message.value = "Heslo musí mať aspoň 6 znakov";
    } else if (password !== confirm) {
      message.value = "Heslá sa nezhodujú";
    } else {
      message.value = "";
    }
  });

  // Watch to update the value of the enabled submit button when the fields are filled and the passwords match
  watch([password, confirm], () => {
    canSubmit.value =
      password.value !== "" &&
      confirm.value !== "" &&
      password.value === confirm.value;
  });
} else {
  // If resetCode is not present, watch the email field
  watch([email], () => {
    canSubmit.value = email.value !== "";
  });
}
</script>

<template>
  <div class="gap-4">
    <h1>Obnovenie hesla</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <field
          v-if="!resetCode"
          name="email"
          v-model="email"
          label="Email"
          type="text"
          class="col-span-1 sm:col-span-2" />
        <field
          v-if="resetCode"
          name="newPassword"
          v-model="password"
          label="Nové heslo"
          type="password" />
        <field
          v-if="resetCode"
          name="confirmPassword"
          v-model="confirm"
          label="Potvrdenie hesla"
          type="password" />
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center sm:grid-rows-1 sm:grid-cols-[1fr_auto]">
        <p
          v-if="message !== ''"
          class="form-message row-start-2 sm:row-start-1">
          {{ message }}
        </p>
        <button
          :disabled="!canSubmit"
          @click="handleReset"
          class="form-primary vertical-center col-start-1 sm:col-start-2">
          <span>{{ resetCode ? "Obnoviť heslo" : "Odoslať email" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
