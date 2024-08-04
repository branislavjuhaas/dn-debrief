<!--suppress ALL -->
<script setup>
import { useRoute } from "vue-router";
import { useUserStore } from "../stores.js";
import { onMounted, ref } from "vue";
import router from "../router.js";

const route = useRoute();

const subject = route.query.subject;
const subAccusative = route.query.subacc;
const amount = route.query.amount;

if (!subject || !subAccusative || !amount) {
  router.push({ name: "Home" });
}

const userStore = useUserStore();

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const formattedDate = `${year}${month}${day}`;

const link = `https://payme.sk/?V=1&IBAN=SK4011000000002665455121&AM=${amount}&CC=EUR&DT=${formattedDate}&PI=/VS/SS/KS&MSG=${encodeURI((userStore.uid || "guest") + " " + (subject || ""))}&CN=Slovensk%C3%A1%20debatn%C3%A1%20asoci%C3%A1cia`;

const qr = ref(null);
const isLoading = ref(true);

onMounted(async () => {
  const response = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(link)}`,
  );
  const blob = await response.blob();
  qr.value = URL.createObjectURL(blob);
  isLoading.value = false;
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{ "Platba za " + subAccusative }}
    </h1>
    <div
      class="grid grid-rows-[auto_auto] grid-cols-1 w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 sm:grid-rows-1 sm:grid-cols-[auto_1fr]">
      <transition name="fade">
        <div v-if="isLoading" class="h-80 w-80 bg-white"></div>
        <div v-else class="flex flex-col items-center">
          <img :src="qr" alt="QR Code" class="w-80 rounded-xl" />
        </div>
      </transition>
      <div class="flex flex-col gap-4 justify-between">
        <div class="flex flex-col gap-4">
          <div class="information vertical-center">
            <p class="font-bold">Príjemca</p>
            <p>SK40 1100 0000 0026 6545 5121</p>
          </div>
          <div class="information vertical-center">
            <p class="font-bold">Suma</p>
            <p>{{ amount }} €</p>
          </div>
          <div class="information vertical-center">
            <p class="font-bold">Poznámka</p>
            <p>{{ (userStore.uid || "guest") + " " + subject }}</p>
          </div>
        </div>
        <a :href="link" class="form-primary vertical-center">
          <p>Použiť platobný link</p>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.5s;
}

.fade-leave-active {
  display: none;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.information {
  @apply flex flex-row justify-between h-12 px-5 items-center text-black;
}
</style>
