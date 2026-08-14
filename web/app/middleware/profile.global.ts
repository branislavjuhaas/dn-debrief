const isProfileComplete = async () => {
  const session = await useAuthClient().getSession({
    fetchOptions: {
      headers: useRequestHeaders(["cookie"]) as Record<string, string>,
    },
  });

  // 2. If user is not authenticated at all, treat profile check as passed (not required)
  const user = session.data?.user;
  if (!user) return true;

  // 3. Authenticated user: check mandatory fields
  const requiredFields = [
    user.name,
    user.surname,
    user.birthDate,
    user.street,
    user.postalCode,
    user.town,
    user.phone,
  ];

  return requiredFields.every(Boolean);
};

export default defineNuxtRouteMiddleware(async (to) => {
  const setupRoute = "/auth/register?completion=true";

  if (!(await isProfileComplete()) && to.fullPath !== setupRoute) {
    return navigateTo(setupRoute);
  }
});
