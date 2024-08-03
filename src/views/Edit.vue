<script setup>
import Field from "../components/Field.vue";
import { useUserStore } from "../stores.js";
import { translateError } from "../translate.js";
import { ref, watch } from "vue";

const userStore = useUserStore();

const password = ref("");
const confirm = ref("");

const message = ref("");
const canSubmit = ref(false);

const change = async () => {
  const { changePassword } = await import("../firebase/auth.js");

  changePassword(password.value).catch((error) => {
    console.error("Error changing password: ", error);
    message.value = translateError(error.code);
  });
};

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
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">{{ userStore.fullName }}</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <field
          name="newPassword"
          v-model="password"
          label="Nové heslo"
          type="password" />
        <field
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
          @click="change"
          class="form-primary vertical-center col-start-1 sm:col-start-2">
          <span>Zmeniť</span>
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
