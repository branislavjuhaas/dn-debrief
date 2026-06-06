export default defineNuxtRouteMiddleware((_to, _from) => {
  const userStore = useUserStore();

  if (userStore.user) {
    return navigateTo("/profile");
  }
});
