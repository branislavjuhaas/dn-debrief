<script setup>
// Import necessary Vue functions and custom hooks
import { onMounted, ref, watch, watchEffect } from "vue";
import { useUserStore } from "../stores.js";
import { feed } from "../firebase/messaging.js";

// Get the user store
const user = useUserStore();

/**
 * Function that will return "Dobrý deň", if the user role is admin or developer and otherwise "Ahoj".
 * It can be called any time in the template.
 * @type {import('vue').Ref<string>}
 */
const greeting = ref("Ahoj");

/**
 * The name of the system. It can be "Cascade", "DebRIEF", or "Barca" depending on the hostname.
 * @type {string}
 */
let system = "Cascade";

/**
 * Function to set the system name based on the hostname.
 * If the hostname is "debrief.sda.sk", the system name is set to "DebRIEF".
 * If the hostname is "barca.juhaas.eu", the system name is set to "Barca".
 * Otherwise, the system name remains "Cascade".
 */
const setSystemName = () => {
  if (window.location.hostname === "debrief.sda.sk") {
    system = "DebRIEF";
  } else if (window.location.hostname === "barca.juhaas.eu") {
    system = "Barca";
  }
};

// Call the function to set the system name
setSystemName();

/**
 * Watch the user role and update the greeting accordingly.
 */
watch(
  () => user.role,
  () => {
    if (user.role === "admin" || user.role === "developer") {
      greeting.value = "Dobrý deň";
    } else {
      greeting.value = "Ahoj";
    }
  },
);

// Get the feed from firebase/messaging.js,
/**
 * @type {import('vue').Ref<any[]>}
 */
const userFeed = ref([]);

/**
 * On component mount, fetch the user feed and log it.
 */
onMounted(async () => {
  userFeed.value = await feed(user);
  console.log(userFeed.value);
});

/**
 * Watch the user UID and update the user feed when it changes.
 */
watchEffect(async () => {
  if (user.uid != null) {
    userFeed.value = await feed(user);
    console.log(userFeed.value);
  }
});
</script>

<template>
  <div>
    <h1 class="text-5xl font-bold">
      {{
        user.uid != null
          ? greeting + ", " + user.name + "!"
          : "Vitaj v systéme " + system + "!"
      }}
    </h1>
    <div
      class="flex flex-row text-base font-bold gap-3 mt-10 items-center leading-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        class="w-5 shrink-0">
        <path
          d="M18.797 10C18.7988 10.2563 18.7208 10.5069 18.5738 10.7169C18.4269 10.9269 18.2181 11.0859 17.9766 11.1719L12.9845 12.9844L11.172 17.9766C11.0832 18.2158 10.9233 18.4221 10.7138 18.5678C10.5043 18.7135 10.2552 18.7916 10.0001 18.7916C9.74491 18.7916 9.49585 18.7135 9.28636 18.5678C9.07688 18.4221 8.917 18.2158 8.8282 17.9766L7.0157 12.9844L2.02351 11.1719C1.78429 11.0831 1.57798 10.9232 1.43228 10.7137C1.28659 10.5042 1.2085 10.2552 1.2085 10C1.2085 9.74485 1.28659 9.49579 1.43228 9.2863C1.57798 9.07682 1.78429 8.91694 2.02351 8.82814L7.0157 7.01564L8.8282 2.02345C8.917 1.78423 9.07688 1.57792 9.28636 1.43222C9.49585 1.28653 9.74491 1.20844 10.0001 1.20844C10.2552 1.20844 10.5043 1.28653 10.7138 1.43222C10.9233 1.57792 11.0832 1.78423 11.172 2.02345L12.9845 7.01564L17.9766 8.82814C18.2181 8.91412 18.4269 9.07314 18.5738 9.28314C18.7208 9.49314 18.7988 9.74369 18.797 10Z"
          fill="white" />
      </svg>
      <h6 class="mt-1">Pre teba</h6>
    </div>
    <div class="flex flex-col mt-2">
      <div
        v-for="(message, index) in userFeed"
        :key="message.id"
        :style="{ '--delay': index / 10 + 's' }"
        class="chip-container mb-2">
        <div v-if="!message.link" class="chip">
          <h6>{{ message.title }}</h6>
          <p>{{ message.message }}</p>
        </div>
        <router-link v-else-if="message.local" :to="message.link" class="chip">
          <h6>{{ message.title }}</h6>
          <p>{{ message.message }}</p>
        </router-link>
        <a v-else :href="message.link" class="chip">
          <h6>{{ message.title }}</h6>
          <p>{{ message.message }}</p>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chip {
  @apply grid grid-rows-[auto_auto] w-full h-full gap-1 bg-white text-black pt-3 pb-2 px-5 rounded-[1.25rem];
}

.chip-container {
  opacity: 0;
  transform: translateY(20px);
  animation: slideIn 0.5s forwards var(--delay);
}

.chip h6 {
  @apply font-bold;
}

@keyframes slideIn {
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
