<!--suppress ALL -->
<script setup>
// Importing necessary components and libraries
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { useLoadingStore, useUserStore } from "./stores.js";
import { nextTick, onMounted, watchEffect } from "vue";
import { googleOneTap } from "vue3-google-login";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import router from "./router.js";

// Initializing user and loading stores
const userStore = useUserStore();
const loadingStore = useLoadingStore();

// Initializing Firebase auth
const auth = getAuth();

// Router guard to protect routes based on authentication status
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !userStore.uid) {
    next("/auth");
  } else if (to.meta.anonymousOnly && userStore.uid) {
    next("/profile");
  } else {
    next();
  }
});

// After each route change, update the document title
router.afterEach((to, from) => {
  nextTick(() => {
    document.title = "DebRIEF - " + to.meta.title;
  });
});

/**
 * Function to handle user creation
 * @param user - Firebase user object
 * @param userData - User data object
 * @returns {Promise<void>} - Promise to handle user creation
 */
async function handleUserCreation(user, userData) {
  const { createUser, logout } = await import("./firebase/auth.js");

  console.log(userData);

  // If userData is not provided, create a new user
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

    // If the user is not an email password user, create from displayName
    createUser(
      user.uid,
      user.displayName.substring(0, user.displayName.lastIndexOf(" ")),
      user.displayName.substring(user.displayName.lastIndexOf(" ") + 1),
    ).catch((error) => {
      console.error("Error creating user: ", error);
      logout();
      userStore.logOut();
    });

    // Set the user data
    userStore.setUser(
      user.uid,
      user.providerData[0].providerId,
      user.email,
      user.displayName.substring(0, user.displayName.lastIndexOf(" ")),
      user.displayName.substring(user.displayName.lastIndexOf(" ") + 1),
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );

    loadingStore.loadingEnd();
    return;
  }

  // If userData is provided, set the user data
  userStore.setUser(
    user.uid,
    user.providerData[0].providerId,
    user.email,
    userData.name,
    userData.surname,
    userData.role,
    userData.club,
    userData.address,
    userData.phone,
    userData.birthdate,
    userData.seasons,
    userData.medals,
  );
}

/**
 * Function to handle redirection based on route meta
 * @returns {Promise<void>} - Promise to handle redirection
 */
async function handleRedirection() {
  // If the routes meta is anonymousOnly, redirect the home page
  if (
    router.currentRoute.value.meta.anonymousOnly &&
    router.currentRoute.value.path !== "/"
  ) {
    await router.push({ name: "Home" });
  } else {
    await router.push({ path: router.currentRoute.value.path });
  }
  loadingStore.loadingEnd();
}

/**
 * Function to handle Google One Tap login
 * @returns {Promise<void>} - Promise to handle Google One Tap login
 */
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

/**
 * Function to handle Google One Tap login
 * @returns {Promise<void>} - Promise to handle Google One Tap login
 */
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

// Watch for loading state changes and prevent keyboard navigation when loading
watchEffect(() => {
  if (loadingStore.loading) {
    window.addEventListener("keydown", preventKeyboardNavigation, false);
  } else {
    window.removeEventListener("keydown", preventKeyboardNavigation, false);
  }
});

/**
 * Function to prevent keyboard navigation when loading
 * @param e - Event object
 */
function preventKeyboardNavigation(e) {
  e.preventDefault();
}
</script>

<template>
  <!-- Main layout of the application -->
  <div class="grid grid-cols-1 grid-rows-[auto_1fr_auto] w-full h-full">
    <!-- Header component -->
    <Header class="print:hidden" />
    <!-- Main content area -->
    <div
      class="flex h-full w-full items-center flex-col px-5 pb-5 bg-green overflow-y-auto scrollbar-hidden print:overflow-visible">
      <!-- Router view for dynamic content -->
      <router-view
        v-slot="{ Component }"
        class="flex flex-col max-w-[1320px] w-full pt-28 text-white">
        <!-- Transition wrapper for route changes -->
        <transition name="slide-fade" mode="out-in">
          <!-- Dynamic component based on current route -->
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <!-- Footer component -->
    <Footer class="print:hidden" />
    <!-- Loading overlay -->
    <div
      v-if="loadingStore.loading"
      class="absolute inset-0 bg-transparent"></div>
  </div>
</template>

<style scoped>
/* CSS transitions for route changes */
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
