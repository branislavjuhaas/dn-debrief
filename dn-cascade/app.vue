<template>
  <div class="flex flex-col h-dvh w-full">
    <app-header class="fixed w-full top-0 z-50" />
    <main class="flex-1 pt-[3.75rem] pb-[3.75rem] relative">
      <app-loader />
      <nuxt-layout>
        <nuxt-page />
      </nuxt-layout>
    </main>
    <app-footer class="fixed bottom-0 w-full z-50" />
  </div>
</template>

<script setup lang="ts"></script>

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
