<template>
  <div>
    <NuxtRouteAnnouncer />
    <AppHeader />
    <main class="flex-1 pt-[3.75rem] pb-[3.75rem] relative">
      <app-loader />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>
    <AppFooter />
  </div>
</template>
