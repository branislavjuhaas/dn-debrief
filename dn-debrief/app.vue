<template>
  <div>
    <NuxtRouteAnnouncer />
    <AppHeader />
    <main class="flex-1 pt-[3.75rem] pb-[3.75rem] relative">
      <AppLoader />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
/* Slide fade transition used for page transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.21s, opacity 0.21s ease;
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

/* Fade transition used for layout transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.21s ease;
  position: relative;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-from,
.fade-leave {
  opacity: 0;
}
</style>
