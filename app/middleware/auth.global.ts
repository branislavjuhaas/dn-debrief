export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();

  if (to.meta.auth && !userStore.isAuthenticated) {
    return navigateTo("/auth");
  }

  // if (to.meta.auth && userStore.isAuthenticated && !userStore.isCompleteUser) {
  //   return navigateTo("/auth/register?step=2");
  // }

  if (to.meta.guest && userStore.isAuthenticated) {
    return navigateTo("/profile");
  }

  if (
    to.meta.roles &&
    !(to.meta.roles as string[]).includes((userStore.user as any).role)
  ) {
    return navigateTo("/unauthorized");
  }
});
