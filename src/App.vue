<script setup>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import router from "./router.js";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { nextTick, onMounted } from "vue";
import { useUserStore } from "./stores.js";

const userStore = useUserStore();

router.afterEach((to, from) => {
  nextTick(() => {
    document.title = "DebRIEF - " + to.meta.title;
  });
});

const auth = getAuth();

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    // Check if user is signed in
    const { getUser } = await import("./firebase/auth.js");
    if (user) {
      // User is signed in, log the user in and redirect to the home page
      console.log("User " + user.uid + " is signed in");

      // If the user does not exist, create it
      // Redirect the user to the home page
      getUser(user.uid).then(async (userData) => {
        if (!userData) {
          const { createUser, logout } = await import("./firebase/auth.js");
          console.log("Creating user: ", user);
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
            user.email,
            user.displayName.substring(0, user.displayName.lastIndexOf(" ")),
            user.displayName.substring(user.displayName.lastIndexOf(" ") + 1),
            null,
          );

          return;
        }

        userStore.setUser(
          user.uid,
          user.email,
          userData.name,
          userData.surname,
          userData.role,
        );
      });
      await router.push("/");
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
    <div class="flex items-center flex-col px-5 bg-green">
      <router-view
        v-slot="{ Component }"
        class="flex flex-col max-w-[1320px] w-full h-full pt-28 text-white">
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
