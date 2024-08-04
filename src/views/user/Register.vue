<script setup>
import Field from "../../components/Field.vue";
import { ref, watch } from "vue";
import { useUserStore } from "../../stores.js";
import { translateError } from "../../translate.js";

const email = ref("");
const name = ref("");
const surname = ref("");
const password = ref("");
const confirm = ref("");

const message = ref("");
const canSubmit = ref(false);

const userStore = useUserStore();

const register = async () => {
  if (
    email.value === "" ||
    name.value === "" ||
    surname.value === "" ||
    password.value === "" ||
    confirm.value === ""
  ) {
    message.value = "Vyplňte všetky polia";
    return;
  }

  userStore.setUser(
    null,
    null,
    email.value,
    name.value,
    surname.value,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  );

  const { emailRegister, createUser } = await import("../../firebase/auth.js");

  // Register the user and ate the user in the database with the uid from the authentication returns uid
  emailRegister(email.value, password.value).catch((error) => {
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
watch([email, name, surname, password, confirm], () => {
  canSubmit.value =
    email.value !== "" &&
    name.value !== "" &&
    surname.value !== "" &&
    password.value !== "" &&
    confirm.value !== "" &&
    password.value === confirm.value;
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Registrácia do systému</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <field
          name="email"
          v-model="email"
          label="Email"
          type="text"
          class="col-span-1 sm:col-span-2" />
        <field name="firstname" v-model="name" label="Meno" type="text" />
        <field
          name="surname"
          v-model="surname"
          label="Priezvisko"
          type="text" />
        <field
          name="newPassword"
          v-model="password"
          label="Heslo"
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
          @click="register"
          class="form-primary vertical-center col-start-1 sm:col-start-2">
          <span>Vytvoriť účet</span>
        </button>
      </div>
    </div>
    <router-link to="/auth" class="alternative vertical-center w-full">
      <p>Prihlásiť sa s existujúcim účtom</p>
    </router-link>
  </div>
</template>

<style scoped>
.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}
</style>
