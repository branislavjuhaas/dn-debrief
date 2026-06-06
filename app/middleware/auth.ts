export default defineNuxtRouteMiddleware((to, _from) => {
  const userStore = useUserStore();

  if (!userStore.user) {
    return navigateTo(`/auth?next=${to.fullPath}`);
  }

  const allowedRoles = to.meta.allowedRoles as string[] | undefined;

  if (allowedRoles && !allowedRoles.includes(userStore.user.role)) {
    return navigateTo("/");
  }
});
