<script setup>
import { computed, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import { useStatesStore, useUserStore } from "./stores/stores.js";
import { useRouter } from "vue-router";
import { getUserData } from "./firebase.js";

const userStore = useUserStore();
const auth = getAuth();

const router = useRouter();

// variable loading that is accessible from all components
const statesStore = useStatesStore();
const loading = computed(() => statesStore.loading);

const createSignInRouteWork = () => {
  // if the current route is the /auth route, redirect to the home route
  if (router.currentRoute.value.name === "Auth") {
    router.push({ name: "Home" });
  }

  // Create a route work that redirects to the home route if the user tries to access the /auth route
  router.beforeEach((to, from, next) => {
    if (to.path === "/auth") {
      next("/users/me");
    } else {
      next();
    }
  });
};

const removeSignInRouteWork = () => {
  router.beforeEach((to, from, next) => {
    if (to.path === "/auth") {
      next();
    } else {
      next();
    }
  });
};

const login = async (uid) => {
  // Get user data and set it to the user store using current email
  getUserData(uid).then((data) => {
    // Set the user data to the user store and create the sign in route work
    userStore.setUser(uid, auth.currentUser.email, data);
    createSignInRouteWork();
  });

  statesStore.stopLoading();
};

onMounted(() => {
  statesStore.startLoading();
  onAuthStateChanged(auth, (user) => {
    // Check if user is signed in
    if (user) {
      // User is signed in, update the user store.
      login(user.uid);
    } else {
      // No user is signed in, log out the user, stop loading and remove the sign in route work
      userStore.logOut();
      statesStore.stopLoading();
      removeSignInRouteWork();
    }
  });
});
</script>

<template>
  <div id="view">
    <Header />
    <div id="content">
      <div class="centered">
        <router-view id="router" v-slot="{ Component }">
          <Transition name="slide" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </div>
    <Footer />
    <transition name="fade">
      <div v-if="loading" id="loader"></div>
    </transition>
  </div>
</template>

<style scoped>
#view {
  display: grid;
  grid-template-rows: 3.75rem 1fr 3.75rem;
  grid-template-columns: 100%;
  height: 100%;
  width: 100%;
}

#content {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: scroll;
  scrollbar-width: none;
  background: var(--sda-green);
}

#loader {
  position: absolute;
  bottom: calc(3.6rem - 2px);
  right: 40px;
  height: 4px;
  width: 100px;
  background: var(--sda-red);
  border-radius: 2px;
  animation: load 1.5s infinite;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.21s,
    opacity 0.21s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(30%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.21s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

@keyframes load {
  0% {
    left: -20%;
    width: 15%;
  }
  50% {
    width: 40%;
  }
  100% {
    width: 20%;
    left: 120%;
  }
}
</style>
