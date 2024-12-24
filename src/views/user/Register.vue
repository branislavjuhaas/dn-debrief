<script setup>
// Import necessary components and functions
import Field from "../../components/Field.vue";
import { ref, watch } from "vue";
import { useUserStore } from "../../stores.js";
import { translateError } from "../../translate.js";
import router from "../../router.js";

// Define reactive variables
const email = ref("");
const name = ref("");
const surname = ref("");
const password = ref("");
const confirm = ref("");
const message = ref("");
const canSubmit = ref(false);

// Get the user store
const userStore = useUserStore();

/**
 * This asynchronous function handles user registration.
 * It first checks if all required fields are provided, if not it sets the message to "Vyplňte všetky polia" and returns.
 * Then, it sets the user data in the user store.
 * It imports the `emailRegister` function from the firebase auth module, and attempts to register the user.
 * If an error occurs during registration, it translates the error message and sets it to the message variable.
 *
 * @async
 * @function register
 * @returns {Promise<void>} - A Promise that resolves when the registration attempt has been made.
 */
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

  const { emailRegister } = await import("../../firebase/auth.js");

  emailRegister(email.value, password.value)
    .then(() => {
      router.push({
        name: "Join",
        query: {
          message:
            "Ak sa chceš zúčastniť našich podujatí, staň sa členom alebo členkou SDA!",
        },
      });
    })
    .catch((error) => {
      message.value = translateError(error.code);
    });
};

/**
 * This function watches the password and confirm fields.
 * If the length of the password is less than 6 characters, it sets the message to "Heslo musí mať aspoň 6 znakov".
 * If the password and confirm fields do not match, it sets the message to "Heslá sa nezhodujú".
 * Otherwise, it clears the message.
 */
watch([password, confirm], ([password, confirm]) => {
  if (password.length < 6) {
    message.value = "Heslo musí mať aspoň 6 znakov";
  } else if (password !== confirm) {
    message.value = "Heslá sa nezhodujú";
  } else {
    message.value = "";
  }
});

/**
 * This function watches the email, name, surname, password, and confirm fields.
 * It updates the value of the enabled submit button when the fields are filled and the passwords match.
 */
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
    <h1>Registrácia do systému</h1>
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
