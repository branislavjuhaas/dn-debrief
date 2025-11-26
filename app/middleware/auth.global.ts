export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();

  if (to.meta.auth && !userStore.isAuthenticated) {
    return navigateTo("/auth");
  }

  if (to.meta.auth && userStore.isAuthenticated && !userStore.isCompleteUser) {
    return navigateTo("/auth/register?collection=true");
  }

  if (to.meta.guest && userStore.isAuthenticated) {
    return navigateTo("/profile");
  }

  if (
    to.meta.halfguest &&
    userStore.isAuthenticated &&
    userStore.isCompleteUser
  ) {
    return navigateTo("/profile");
  }

  if (
    to.meta.roles &&
    !(to.meta.roles as string[]).includes((userStore.user as any).role)
  ) {
    return navigateTo("/unauthorized");
  }

  if (
    userStore.isAuthenticated &&
    !userStore.isCompleteUser &&
    to.path !== "/auth/register"
  ) {
    return navigateTo("/auth/register?collection=true");
  }
});
