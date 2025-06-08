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

<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser(); // This will attempt to get the user from the cookie on SSR
const userStore = useUserStore();

// Use useAsyncData to fetch user data. This will run on SSR if user is available.
// The key 'userData' ensures this logic runs once per request (SSR) and hydrates on client.
await useAsyncData(
  "userData",
  async () => {
    if (user.value?.id) {
      // If user is available (e.g., from session cookie on SSR, or already authenticated on client)
      // and not yet in store, fetch their data.
      if (!userStore.isAuthenticated || userStore.authId !== user.value.id) {
        await userStore.fetchUserData(user.value.id);
      }
    }
    return userStore.user; // The return value is available to useAsyncData if needed elsewhere
  },
  {
    server: true, // Explicitly ensure this runs on the server
  },
);

onMounted(() => {
  // Client-side: Set up a listener for authentication state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    const authUserId = session?.user?.id;

    switch (event) {
      case "INITIAL_SESSION":
        // This event fires on client initialization.
        // If Supabase client confirms a user session and the store doesn't match, update the store.
        if (
          authUserId &&
          (userStore.authId !== authUserId || !userStore.isAuthenticated)
        ) {
          await userStore.fetchUserData(authUserId);
        } else if (!authUserId && userStore.isAuthenticated) {
          // No active session according to Supabase, but store has a user. Clear it.
          userStore.clearUserData();
        }
        break;
      case "SIGNED_IN":
        if (authUserId) {
          // User signed in on the client, fetch their data.
          await userStore.fetchUserData(authUserId);
        }
        break;
      case "TOKEN_REFRESHED":
        // Session token refreshed. Re-fetch data if user ID is present,
        // as user details or claims might have changed.
        if (authUserId && userStore.isAuthenticated) {
          await userStore.fetchUserData(authUserId);
        } else if (authUserId && !userStore.isAuthenticated) {
          // User was not in store but token refresh implies a session
          await userStore.fetchUserData(authUserId);
        }
        break;
      case "SIGNED_OUT":
        // User signed out on the client, clear user data in store.
        userStore.clearUserData();
        break;
    }
  });
});
</script>

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
