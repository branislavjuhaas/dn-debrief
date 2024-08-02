<script setup>
import { useUserStore } from "../stores.js";
import { translateKey } from "../translate.js";
import router from "../router.js";

const userStore = useUserStore();

const logout = async () => {
  const { logout } = await import("../firebase/auth.js");

  logout().catch((error) => {
    console.error("Error logging out: ", error);
  });

  await router.push("/");
};
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">{{ userStore.fullName }}</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="data in userStore.additionalDataArray"
          :key="data.name"
          class="flex flex-row justify-between h-12 px-5 items-center text-black vertical-center">
          <p class="font-bold">{{ translateKey(data.name) }}</p>
          <p>{{ data.value }}</p>
        </div>
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center sm:grid-rows-1 sm:grid-cols-[1fr_auto_auto]">
        <div class="col-start-1"></div>
        <button
          v-if="userStore.provider === 'password'"
          @click="router.push('/profile/edit')"
          class="form-secondary vertical-center col-start-1 sm:col-start-2">
          <span>Zmeniť heslo</span>
        </button>
        <button
          @click="logout"
          class="form-primary vertical-center col-start-1 sm:col-start-3">
          <span>Odhlásiť sa</span>
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
