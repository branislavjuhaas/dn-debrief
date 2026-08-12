export default defineNuxtRouteMiddleware(async (to, _from) => {
  const session = await useAuthClient().getSession({
    fetchOptions: {
      headers: useRequestHeaders(["cookie"]) as Record<string, string>,
    },
  });

  if (!session.data?.user) {
    return navigateTo(`/auth?next=${to.fullPath}`);
  }

  const allowedRoles = to.meta.allowedRoles as string[] | undefined;

  if (allowedRoles && !allowedRoles.includes(session.data?.user.role ?? "")) {
    return navigateTo("/");
  }
});
