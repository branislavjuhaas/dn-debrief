<script setup>
import { ref } from "vue";
import { translateError } from "../translate.js";
import Field from "../components/Field.vue";
import Toggle from "../components/Toggle.vue";

const email = ref("");
const password = ref("");
const remember = ref(false);

const message = ref("");

const login = async () => {
  if (email.value === "" || password.value === "") {
    message.value = "Vyplňte všetky polia";
  } else {
    const { emailLogin } = await import("../firebase/auth.js");

    message.value = "";
    emailLogin(email.value, password.value, remember.value).catch((error) => {
      message.value = translateError(error.code);
    });
  }
};

const googleLogin = async () => {
  const { googleLogin } = await import("../firebase/auth.js");

  googleLogin().catch((error) => {
    message.value = translateError(error.code);
  });
};
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Prihlásenie do účtu</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <field name="email" v-model="email" label="Email" type="text" />
          <field
            name="password"
            v-model="password"
            label="Heslo"
            type="password" />
        </div>
        <router-link
          :to="'/auth/forgot?email=' + email"
          class="text-red ml-5 hover:text-black">
          Zabudol si heslo?
        </router-link>
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center sm:grid-rows-1 sm:grid-cols-[1fr_auto_auto]">
        <p
          v-if="message !== ''"
          class="form-message row-start-3 sm:row-start-1">
          {{ message }}
        </p>
        <toggle
          v-model="remember"
          class="col-start-1 sm:col-start-2"
          label="Zapamätať" />
        <button
          class="form-primary vertical-center col-start-1 sm:col-start-3"
          @click="login">
          <span>Prihlásiť sa</span>
        </button>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-5 w-full sm:grid-cols-2">
      <button @click="googleLogin" class="alternative vertical-center">
        <span>Prihlásiť sa pomocou účtu Google</span>
      </button>
      <router-link to="/auth/register" class="alternative vertical-center">
        <p>Vytvoriť nový účet</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}
</style>
