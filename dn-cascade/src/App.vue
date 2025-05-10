<script setup lang="ts">
import AppHeader from "./views/components/AppHeader.vue";
import AppFooter from "./views/components/AppFooter.vue";
</script>

<template>
  <div class="grid grid-rows-[auto_1fr_auto] w-full h-full">
    <app-header />
    <div
      class="flex h-full w-full items-center flex-col px-5 pb-5 bg-green overflow-y-auto scrollbar-hidden print:overflow-visible">
      <router-view
        v-slot="{ Component }"
        class="flex flex-col max-w-content w-full pt-28">
        <!-- Transition wrapper for route changes -->
        <transition name="slide-fade" mode="out-in">
          <!-- Dynamic component based on current route -->
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <app-footer />
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
