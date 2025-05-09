<script setup lang="ts"></script>

<template>
  <div class="bg-green">
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
