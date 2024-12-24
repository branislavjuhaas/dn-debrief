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
import { logEvent } from "firebase/analytics";
import { analytics } from "./main.js";

const host = window.location.hostname;
let title = "DN Cascade";

if (host === "debrief.sda.sk") {
  title = "DebRIEF";
} else if (host === "barca.juhaas.eu") {
  title = "Barca";
} else if (host.includes("dev") || host === "localhost") {
  title = "DN Cascade Dev";
}

// Initializing user and loading stores
const userStore = useUserStore();
const loadingStore = useLoadingStore();

// Initializing Firebase auth
const auth = getAuth();

// After each route change, update the document title
router.afterEach((to, from) => {
  nextTick(() => {
    document.title = title + " - " + to.meta.title;
  });
});

/**
 * Function to handle user creation
 * @param user - Firebase user object
 * @param userData - User data object
 * @returns {Promise<void>} - Promise to handle user creation
 */
const handleUserCreation = async (user, userData) => {
  const { createUser, logout } = await import("./firebase/auth.js");

  console.log(userData);

  if (host.includes("dev") && !userData.dev) {
    await router.push({ name: "Undev" });
    logout();
    return;
  }

  // If userData is not provided, create a new user
  if (!userData) {
    // If the user is email password user, create from store
    if (user.providerData[0].providerId === "password") {
      createUser(user.uid, user.email, userStore.name, userStore.surname).catch(
        (error) => {
          console.error("Error creating user: ", error);
          logout();
          userStore.logOut();
        },
      );

      userStore.uid = user.uid;
      loadingStore.loadingEnd();
      return;
    }

    console.log(
      user.displayName.substring(user.displayName.lastIndexOf(" ") + 1),
    );

    // If the user is not an email password user, create from displayName
    createUser(
      user.uid,
      user.email,
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
      null,
      null,
      null,
    );

    loadingStore.loadingEnd();

    // Redirect to the Join page with a query parameter
    await router.push({
      name: "Join",
      query: {
        message:
          "Ak sa chceš zúčastniť našich podujatí, staň sa členom alebo členkou SDA!",
      },
    });

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
    userData.supervisor,
    userData.supervisorEmail,
    userData.seasons,
    userData.awards,
    userData.clubManager,
  );
};

/**
 * Function to handle redirection based on route meta
 * @returns {Promise<void>} - Promise to handle redirection
 */
const handleRedirection = async (authenticated) => {
  try {
    console.log(
      "Redirecting user based on route meta, which is: ",
      router.currentRoute.value.name,
    );
    // If the user is already on the home page, do nothing
    if (
      router.currentRoute.value.name === "Home" ||
      router.currentRoute.value.name === "Undev"
    ) {
      return;
    }

    const routeMeta = router.currentRoute.value.meta;

    // If the route's meta is anonymousOnly and user is logged in, redirect to home
    if (routeMeta.anonymousOnly && authenticated) {
      console.log("Redirecting to home");
      await router.push({ name: "Home" });
    }
    // If the route's meta requiresAuth and user is not logged in, redirect to auth
    else if (routeMeta.requiresAuth && !authenticated) {
      await router.push({ name: "Auth" });
    }
    // If the route's meta requires a specific role and user does not have it, redirect to unauthorized
    else if (routeMeta.roles && !routeMeta.roles.includes(userStore.role)) {
      await router.push({ name: "Unauthorized" });
    }
    // Otherwise, refresh the current page
    else {
      await router.push({
        name: router.currentRoute.value.name,
        params: router.currentRoute.value.params,
      });
    }
  } catch (error) {
    console.error("Error during redirection: ", error);
  } finally {
    loadingStore.loadingEnd();
  }
};

/**
 * Function to handle Google One Tap login
 * @returns {Promise<void>} - Promise to handle Google One Tap login
 */
const handleGoogleOneTapLogin = async () => {
  logEvent(analytics, "one_tap_login_attempt", {
    method: "Google One Tap Attempt",
  });
  googleOneTap({ autoLogin: true, cancelOnTapOutside: true }).then(
    async (response) => {
      const { oneTapLogin } = await import("./firebase/auth.js");
      oneTapLogin(response.credential).catch((error) => {
        console.error("Error logging in with Google One Tap: ", error);
      });
      logEvent(analytics, "one_tap_login", { method: "Google One Tap" });
    },
  );
};

/**
 * Function to prevent keyboard navigation when loading
 * @param e - Event object
 */
const preventKeyboardNavigation = (e) => {
  e.preventDefault();
};

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
      if (typeof google !== 'undefined' && google.accounts.id) {
        google.accounts.id.cancel();
      }

      getUser(user.uid).then(async (userData) => {
        await handleUserCreation(user, userData);
        await handleRedirection(true);
      });
    } else {
      // No user is signed in, log out the user, stop loading and remove the sign in route work
      userStore.logOut();
      await handleGoogleOneTapLogin();

      await handleRedirection(false);
    }

    // Router guard to protect routes based on authentication status
    router.beforeEach((to, from, next) => {
      if (to.meta.requiresAuth && !userStore.uid) {
        next("/auth");
      } else if (to.meta.anonymousOnly && userStore.uid) {
        next("/profile");
      } else if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
        next("/unauthorized");
      } else {
        next();
      }
    });
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
