<script setup>
// Import necessary Vue functions and custom hooks
import { onMounted, ref, watch, watchEffect, onUnmounted } from "vue";
import { useEventsStore, useFeedStore, useUserStore } from "../stores.js";
import Event from "../components/Event.vue";
import router from "../router.js";

// Get the user store
const user = useUserStore();

/**
 * Function that will return "Dobrý deň", if the user role is admin or developer and otherwise "Ahoj".
 * It can be called any time in the template.
 * @type {import('vue').Ref<string>}
 */
const greeting = ref(
  user.role === "developer" ? "Dobrý deň" : user.dev ? "Nazdar" : "Ahoj",
);

/**
 * The name of the system. It can be "DN Cascade", "DebRIEF", or "Barca" depending on the hostname.
 * @type {string}
 */
let system = "DN Cascade";

/**
 * Function to set the system name based on the hostname.
 * If the hostname is "debrief.sda.sk", the system name is set to "DebRIEF".
 * If the hostname is "barca.juhaas.eu", the system name is set to "Barca".
 * Otherwise, the system name remains "DN Cascade".
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
    if (user.role === "developer") {
      greeting.value = "Dobrý deň";
    } else {
      greeting.value = "Ahoj";
    }
  },
);

const userFeed = ref({ feed: [], header: null });

const checkHeader = (header) => {
  if (header) {
    return header.repeat === false
      ? localStorage.getItem(`header-${header.id}`) !== "true"
      : true;
  }
  return false;
};

const events = ref([]);

/**
 * On component mount, fetch the user feed and log it.
 */
onMounted(async () => {
  const { feed } = await import("../firebase/messaging.js");

  userFeed.value = await feed(user);

  userFeed.value.header = checkHeader(userFeed.value.header)
    ? userFeed.value.header
    : null;

  if (user.uid == null) {
    return;
  }

  const { relevantEvents } = await import("../firebase/events.js");

  events.value = await relevantEvents();
});

/**
 * Watch the user UID and update the user feed when it changes.
 */
watchEffect(async () => {
  if (user.uid != null) {
    const { feed } = await import("../firebase/messaging.js");
    const { relevantEvents } = await import("../firebase/events.js");

    userFeed.value = await feed(user);

    userFeed.value.header = checkHeader(userFeed.value.header)
      ? userFeed.value.header
      : null;

    events.value = await relevantEvents();
    console.log(userFeed.value);
  }
});

const eventsContainer = ref(null);

const handleWheel = (e) => {
  e.preventDefault();
  if (eventsContainer.value) {
    eventsContainer.value.scrollLeft -= e.deltaY;
  }
};

onMounted(() => {
  if (eventsContainer.value) {
    eventsContainer.value.addEventListener("wheel", handleWheel, {
      passive: false,
    });
  }
});

onUnmounted(() => {
  if (eventsContainer.value) {
    eventsContainer.value.removeEventListener("wheel", handleWheel);
  }
});

const dismissHeader = () => {
  if (userFeed.value.header.repeat === false) {
    localStorage.setItem(`header-${userFeed.value.header.id}`, "true");
  }

  userFeed.value.header = null;
  useFeedStore().dismissHeaderMessage();
};

/**
 * Handles clicks on links within the header.
 * Prevents default navigation. Uses Vue router for internal links
 * and opens external links in a new tab.
 * @param {MouseEvent} e - The click event.
 */
const handleHeaderClick = (e) => {
  const target = e.target.closest("a");
  if (target) {
    const href = target.getAttribute("href");
    if (href) {
      e.preventDefault();
      const url = new URL(href, window.location.origin);
      if (url.hostname === window.location.hostname) {
        router.push(url.pathname + url.search);
      } else {
        window.open(href, "_blank");
      }
    }
  }
};

const imageLoaded = ref(false);
</script>

<template>
  <div>
    <h1 class="leading-[1.1] -mb-2">
      {{
        user.uid != null
          ? greeting + ", " + user.name + "!"
          : "Vitaj v systéme " + system + "!"
      }}
    </h1>

    <div
      class="flex flex-row text-base font-bold gap-3 mt-8 items-center leading-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        class="w-5 shrink-0">
        <path
          d="M18.648 5.74218C18.4693 5.59295 18.2522 5.49697 18.0215 5.4652C17.7908 5.43343 17.5558 5.46714 17.3433 5.56249L13.3902 7.32031L11.0933 3.17968C10.9836 2.98637 10.8245 2.8256 10.6324 2.71376C10.4402 2.60192 10.2219 2.543 9.9996 2.543C9.77728 2.543 9.55894 2.60192 9.36681 2.71376C9.17468 2.8256 9.01563 2.98637 8.90585 3.17968L6.60897 7.32031L2.65585 5.56249C2.44296 5.46728 2.20768 5.43352 1.97662 5.46503C1.74555 5.49654 1.5279 5.59206 1.34828 5.7408C1.16866 5.88953 1.03423 6.08555 0.960186 6.30669C0.886142 6.52783 0.875438 6.76528 0.929283 6.99218L2.91366 15.4531C2.9516 15.6169 3.02241 15.7713 3.12178 15.907C3.22116 16.0426 3.34703 16.1566 3.49178 16.2422C3.68776 16.3595 3.91182 16.4216 4.14022 16.4219C4.25125 16.4217 4.3617 16.4059 4.46835 16.375C8.08539 15.375 11.906 15.375 15.523 16.375C15.8533 16.4618 16.2045 16.4141 16.4996 16.2422C16.6452 16.1577 16.7718 16.044 16.8713 15.9082C16.9708 15.7724 17.0411 15.6174 17.0777 15.4531L19.0699 6.99218C19.1231 6.76521 19.1119 6.52788 19.0373 6.30699C18.9628 6.08611 18.8279 5.89047 18.648 5.74218ZM13.1246 12.6953C13.1074 12.8493 13.0342 12.9917 12.919 13.0954C12.8038 13.1991 12.6546 13.2569 12.4996 13.2578H12.4371C10.8162 13.0937 9.18295 13.0937 7.5621 13.2578C7.39739 13.2753 7.23247 13.2267 7.10356 13.1227C6.97465 13.0187 6.8923 12.8678 6.8746 12.7031C6.85928 12.5376 6.90969 12.3727 7.01495 12.2441C7.1202 12.1154 7.27183 12.0334 7.43709 12.0156C9.1407 11.8359 10.8585 11.8359 12.5621 12.0156C12.7259 12.0334 12.8763 12.1144 12.9813 12.2413C13.0864 12.3682 13.1378 12.5311 13.1246 12.6953Z"
          fill="white" />
      </svg>
      <h6 class="mt-1">Najbližšie relevantné udalosti</h6>
    </div>
    <div
      v-if="userFeed.header"
      class="text-base flex relative font-bold mt-2 h-[14.375rem] w-full rounded-[1.25rem] bg-[#0f2544] overflow-hidden">
      <button
        @click="dismissHeader"
        class="absolute w-8 h-8 overflow-hidden cursor-pointer transition-all duration-200 flex top-4 gap-2 left-4 z-10 bg-white/25 rounded-lg p-1.5 hover:w-[7.4rem]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          class="w-5 h-5 shrink-0">
          <path
            d="M15.1831 3.93306L3.93306 15.1831C3.81585 15.3003 3.75 15.4592 3.75 15.625C3.75 15.7908 3.81585 15.9497 3.93306 16.0669C4.05027 16.1842 4.20924 16.25 4.375 16.25C4.54076 16.25 4.69973 16.1842 4.81694 16.0669L16.0669 4.81694C16.1842 4.69973 16.25 4.54076 16.25 4.375C16.25 4.20924 16.1842 4.05027 16.0669 3.93306C15.9497 3.81585 15.7908 3.75 15.625 3.75C15.4592 3.75 15.3003 3.81585 15.1831 3.93306Z"
            fill="white" />
          <path
            d="M4.81694 3.93306C4.69973 3.81585 4.54076 3.75 4.375 3.75C4.20924 3.75 4.05027 3.81585 3.93306 3.93306C3.81585 4.05027 3.75 4.20924 3.75 4.375C3.75 4.54076 3.81585 4.69973 3.93306 4.81694L15.1831 16.0669C15.3003 16.1842 15.4592 16.25 15.625 16.25C15.7908 16.25 15.9497 16.1842 16.0669 16.0669C16.1842 15.9497 16.25 15.7908 16.25 15.625C16.25 15.4592 16.1842 15.3003 16.0669 15.1831L4.81694 3.93306Z"
            fill="white" />
        </svg>
        <p class="font-normal leading-none mt-1 uppercase">Rozumiem</p>
      </button>
      <div
        class="flex w-full h-full object-cover !text-white leading-tight header-message"
        @click="handleHeaderClick"
        v-html="userFeed.header.content" />
    </div>
    <div
      v-else-if="events.length === 0"
      class="text-base relative font-bold mt-2 h-[14.375rem] w-full rounded-[1.25rem] bg-[#0f2544]">
      <img
        src="../assets/dn-banner.webp"
        alt="event"
        @load="imageLoaded = true"
        :class="[
          'w-full h-full object-cover rounded-[1.25rem] opacity-0',
          { 'events-placeholder': imageLoaded },
        ]" />
      <p
        class="absolute bottom-2 left-[1.125rem] truncate max-w-[calc(100%-2.25rem)]">
        {{
          useUserStore().uid != null
            ? useEventsStore().initialized
              ? "Momentálne nie sú dostupné žiadne podujatia."
              : "Systém čaká na načítanie podujatí."
            : "Pre zobrazenie obsahu sa, prosím, prihlás!"
        }}
      </p>
    </div>
    <div
      v-else
      ref="eventsContainer"
      class="flex flex-row mt-2 gap-[1.25rem] overflow-x-auto scrollbar-hidden events-container">
      <event
        v-for="(event, index) in events"
        :key="event.id"
        :event="event"
        :style="{ '--delay': index / 20 + 's' }"
        class="event-card" />
    </div>

    <div
      class="flex flex-row text-base font-bold gap-3 mt-4 items-center leading-3">
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
        v-for="(message, index) in userFeed.feed"
        :key="message.id"
        :style="{ '--delay': index / 10 + 's' }"
        class="chip-container mb-2 rounded-[1.25rem] duration-500 hover:drop-shadow-2xl">
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
.events-placeholder {
  animation: fadeIn 0.5s forwards;
}
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

.event-card {
  opacity: 0;
  transform: translateX(20px);
  animation: slideInFromRight 0.5s forwards var(--delay);
}

.events-container {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.header-message :deep(h1) {
  @apply text-3xl md:text-4xl;
}

.header-message :deep(p) {
  @apply text-sm md:text-base font-normal;
}

.header-message {
  opacity: 0;
  animation: fadeIn 0.5s forwards;
}

@keyframes slideIn {
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromRight {
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
