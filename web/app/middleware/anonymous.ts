export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const session = await useAuthClient().getSession({
    fetchOptions: {
      headers: useRequestHeaders(["cookie"]) as Record<string, string>,
    },
  });

  if (session.data?.user) {
    return navigateTo("/profile");
  }
});
