<script setup>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import router from "./router.js";
import { nextTick } from "vue";

router.afterEach((to, from) => {
  nextTick(() => {
    document.title = "DebRIEF - " + to.meta.title;
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
