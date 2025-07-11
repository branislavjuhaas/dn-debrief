<script setup lang="ts">
const userStore = {
  isAuthenticated: true, // Example authentication state
  fullName: "Branislav Juhás",
  role: "user", // Example role, can be 'admin', 'user', etc.
};
</script>

<template>
  <div
    class="fixed bottom-0 w-full flex flex-col bg-white text-black min-h-15 items-center justify-center px-5 border-t-2 border-black z-40">
    <!-- <cookies-banner v-if="false" /> -->
    <div
      class="flex flex-row justify-between items-center max-w-[1320px] h-full w-full">
      <p class="hidden mt-1 sm:flex">
        2024 - 2025&nbsp;&nbsp;&nbsp;&nbsp;Branislav Juhás
      </p>

      <div class="flex flex-row gap-14 items-center w-full sm:w-auto">
        <nuxt-link to="/privacy" class="hidden mt-1 sm:flex">GDPR</nuxt-link>
        <!--          v-if="user.role && user.role !== 'user'"-->
        <nuxt-link to="/events" class="hidden mt-1 sm:flex">
          Podujatia
        </nuxt-link>
        <div
          v-if="userStore.isAuthenticated"
          class="w-full sm:w-auto flex flex-row gap-1 items-center">
          <AppButton
            to="/profile"
            variant="secondary"
            size="header"
            right
            class="w-full">
            {{ userStore.fullName || "Profil" }}
          </AppButton>
          <AppFooterMenu />
        </div>
        <AppButton
          v-else
          to="/auth"
          variant="secondary"
          size="header"
          class="w-full min-w-50 sm:w-auto">
          Prihlásiť sa
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
