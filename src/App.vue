<script setup>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import router from "./router.js";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { nextTick, onMounted, watchEffect } from "vue";
import { useLoadingStore, useUserStore } from "./stores.js";
import { googleOneTap } from "vue3-google-login";

const userStore = useUserStore();
const loadingStore = useLoadingStore();

const auth = getAuth();

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !userStore.uid) {
    next("/auth");
  } else if (to.meta.anonymousOnly && userStore.uid) {
    next("/profile");
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  nextTick(() => {
    document.title = "DebRIEF - " + to.meta.title;
  });
});

async function handleUserCreation(user, userData) {
  const { createUser, logout } = await import("./firebase/auth.js");

  if (!userData) {
    // If the user is email password user, create from store
    if (user.providerData[0].providerId === "password") {
      createUser(user.uid, userStore.name, userStore.surname).catch((error) => {
        console.error("Error creating user: ", error);
        logout();
        userStore.logOut();
      });

      userStore.uid = user.uid;
      loadingStore.loadingEnd();
      return;
    }

    createUser(
      user.uid,
      user.displayName.substring(0, user.displayName.lastIndexOf(" ")),
      user.displayName.substring(user.displayName.lastIndexOf(" ") + 1),
    ).catch((error) => {
      console.error("Error creating user: ", error);
      logout();
      userStore.logOut();
    });

    userStore.setUser(
      user.uid,
      user.providerData[0].providerId,
      user.email,
      user.displayName.substring(0, user.displayName.lastIndexOf(" ")),
      user.displayName.substring(user.displayName.lastIndexOf(" ") + 1),
      null,
    );

    loadingStore.loadingEnd();
    return;
  }

  userStore.setUser(
    user.uid,
    user.providerData[0].providerId,
    user.email,
    userData.name,
    userData.surname,
    userData.role,
  );
}

async function handleRedirection() {
  // If the routes meta is anonymousOnly, redirect the home page
  if (
    router.currentRoute.value.meta.anonymousOnly &&
    router.currentRoute.value.path !== "/"
  ) {
    await router.push("/");
  } else {
    await router.push(router.currentRoute.value.fullPath);
  }
  loadingStore.loadingEnd();
}

async function handleGoogleOneTapLogin() {
  googleOneTap({ autoLogin: true, cancelOnTapOutside: true }).then(
    async (response) => {
      const { oneTapLogin } = await import("./firebase/auth.js");
      oneTapLogin(response.credential).catch((error) => {
        console.error("Error logging in with Google One Tap: ", error);
      });
    },
  );
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    // Check if user is signed in
    loadingStore.loadingStart();
    const { getUser } = await import("./firebase/auth.js");
    if (user) {
      // If the user does not exist, create it
      // Redirect the user to the home page
      // if google is defined
      if (google.accounts.id) {
        google.accounts.id.cancel();
      }

      getUser(user.uid).then(async (userData) => {
        await handleUserCreation(user, userData);
      });

      await handleRedirection();
    } else {
      // No user is signed in, log out the user, stop loading and remove the sign in route work
      userStore.logOut();
      await handleGoogleOneTapLogin();

      await handleRedirection();
    }
  });
});

watchEffect(() => {
  if (loadingStore.loading) {
    window.addEventListener("keydown", preventKeyboardNavigation, false);
  } else {
    window.removeEventListener("keydown", preventKeyboardNavigation, false);
  }
});

function preventKeyboardNavigation(e) {
  e.preventDefault();
}
</script>

<template>
  <div class="grid grid-cols-1 grid-rows-[auto_1fr_auto] w-full h-full">
    <Header />
    <div
      class="flex h-full w-full items-center flex-col px-5 pb-5 bg-green overflow-y-auto scrollbar-hidden">
      <router-view
        v-slot="{ Component }"
        class="flex flex-col max-w-[1320px] w-full pt-28 text-white">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <Footer />
    <div
      v-if="loadingStore.loading"
      class="absolute inset-0 bg-transparent"></div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    transform 0.21s,
    opacity 0.21s ease;
  position: relative;
}
.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(5%);
}
.slide-fade-enter-from,
.slide-fade-leave {
  opacity: 0;
  transform: translateY(0%);
}
</style>
