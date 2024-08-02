<script setup>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import router from "./router.js";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { nextTick, onMounted } from "vue";
import { useUserStore } from "./stores.js";
import { googleOneTap } from "vue3-google-login";

const userStore = useUserStore();

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

onMounted(async () => {
  // If user is signed in, return
  if (auth.currentUser) {
    return;
  }

  await googleOneTap({ autoLogin: true }).then(async (response) => {
    const { oneTapLogin } = await import("./firebase/auth.js");
    oneTapLogin(response.credential).catch((error) => {
      console.error("Error logging in with Google One Tap: ", error);
    });
  });
});

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    // Check if user is signed in
    const { getUser } = await import("./firebase/auth.js");
    if (user) {
      // If the user does not exist, create it
      // Redirect the user to the home page
      // if google is defined
      if (google.accounts.id) {
        google.accounts.id.cancel();
      }

      getUser(user.uid).then(async (userData) => {
        if (!userData) {
          const { createUser, logout } = await import("./firebase/auth.js");

          // If the user is email password user, create from store
          if (user.providerData[0].providerId === "password") {
            createUser(user.uid, userStore.name, userStore.surname).catch(
              (error) => {
                console.error("Error creating user: ", error);
                logout();
                userStore.logOut();
              },
            );

            userStore.uid = user.uid;
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
      });
      // If the route is auth, auth/forgot, auth/register, profile or profile/reset, redirect to the home page
      if (
        router.currentRoute.value.path.includes("/auth") ||
        router.currentRoute.value.path.includes("/profile")
      ) {
        await router.push("/");
      }
    } else {
      // No user is signed in, log out the user, stop loading and remove the sign in route work
      userStore.logOut();
    }
  });
});
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
