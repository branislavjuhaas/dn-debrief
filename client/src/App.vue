<script setup>
import { computed, onMounted, ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import { useUserStore, useStatesStore } from "./stores/stores.js";
import { useRouter } from "vue-router";
import {
  getDocs,
  query,
  where,
  collection,
  documentId,
} from "firebase/firestore";
import { db } from "./firebase.js";

const userStore = useUserStore();
const auth = getAuth();

const router = useRouter();

// variable loading that is accessible from all components
const statesStore = useStatesStore();
const loading = computed(() => statesStore.loading);

const login = async (uid) => {
  // from the firestore database, get the user with the document id equal to the uid
  const q = query(collection(db, "users"), where(documentId(), "==", uid));
  await getDocs(q)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        userStore.setUser(
          uid,
          doc.data().name,
          doc.data().surname,
          auth.currentUser.email,
          doc.data().role,
        );

        // If the route is /auth, redirect to the home page
        if (router.currentRoute.value.path === "/auth") {
          router.push("/");
        }

        // Set the redirect path from the /auth route to /users/me
        router.beforeEach((to, from, next) => {
          if (to.path === "/auth") {
            next("/users/me");
          } else {
            next();
          }
        });
      });
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
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
      // No user is signed in.
      userStore.logOut();
      statesStore.stopLoading();
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
