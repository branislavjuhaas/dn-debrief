<script setup>
import Field from "../components/Field.vue";
import { ref, watch } from "vue";
import { translateError } from "../translate.js";

// Code is an argument oobCode if it exists and if mode argument is equal to resetPassword, otherwise null
let resetCode = null;

if (window.location.search.includes("oobCode")) {
  const urlParams = new URLSearchParams(window.location.search);
  resetCode = urlParams.get("oobCode");
}

console.log(resetCode);

const email = ref(
  window.location.search.includes("email")
    ? window.location.search.split("email=")[1]
    : "",
);
const password = ref("");
const confirm = ref("");

const message = ref("");
const canSubmit = ref(false);

if (!resetCode && email.value !== "") {
  canSubmit.value = true;
}

const resetPassword = async () => {
  const { resetPassword } = await import("../firebase/auth.js");

  resetPassword(resetCode, password.value)
    .catch((error) => {
      message.value = translateError(error.code);
      throw error;
    })
    .then(() => {
      message.value = "Heslo bolo zmenené";

      setTimeout(() => {
        window.location.href = "/auth";
      }, 3000);
    });
};

const sendReset = async () => {
  const { sendResetEmail } = await import("../firebase/auth.js");

  sendResetEmail(email.value)
    .catch((error) => {
      message.value = translateError(error.code);
      throw error;
    })
    .then(() => {
      message.value = "Email bol odoslaný";

      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    });
};

const handleReset = async () => {
  if (resetCode) {
    await resetPassword();
    return;
  }

  await sendReset();
};

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
  watch([email], () => {
    canSubmit.value = email.value !== "";
  });
}
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Obnovenie hesla</h1>
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

<style scoped>
.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}
</style>
