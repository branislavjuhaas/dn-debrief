<script setup>
// Import necessary Vue functions and router
import { useRoute } from "vue-router";
import { useUserStore } from "../stores.js";
import { onMounted, ref, watchEffect } from "vue";
import router from "../router.js";

// Get the route details
const route = useRoute();

// Extract query parameters from the route
const subject = route.query.subject;
const subAccusative = route.query.subacc;
const amount = route.query.amount;

/**
 * This function checks if the necessary query parameters are present.
 * If not, it redirects the user to the home page.
 */
function checkQueryParameters() {
  if (!subject || !subAccusative || !amount) {
    router.push({ name: "Home" });
  }
}

// Call the function to check the query parameters
checkQueryParameters();

// Get the user store
const userStore = useUserStore();

// Get the current date and format it
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const formattedDate = `${year}${month}${day}`;

// Define refs for the QR code, loading state, and payment link
const qr = ref(null);
const isLoading = ref(true);
const link = ref("");

/**
 * This asynchronous function fetches a QR code for the payment link.
 * It sets the loading state to true, fetches the QR code, and sets the QR code and loading state.
 *
 * @async
 */
const fetchQrCode = async () => {
  const response = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(link.value)}`,
  );
  const blob = await response.blob();
  qr.value = URL.createObjectURL(blob);
  isLoading.value = false;
};

// Watch for changes in the user store and generate the payment link when the user is loaded
watchEffect(() => {
  if (userStore.fullName) {
    link.value = `https://payme.sk/?V=1&IBAN=SK4011000000002665455121&AM=${amount}&CC=EUR&DT=${formattedDate}&PI=/VS/SS/KS&MSG=${encodeURI((userStore.fullName || "guest") + " " + (subject || ""))}&CN=Slovensk%C3%A1%20debatn%C3%A1%20asoci%C3%A1cia`;
    fetchQrCode();
  }
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
            <p>{{ (userStore.fullName || "guest") + " " + subject }}</p>
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
