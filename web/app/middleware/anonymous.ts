export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const session = await useAuthClient().getSession();

  if (session.data?.user) {
    return navigateTo("/profile");
  }
});
