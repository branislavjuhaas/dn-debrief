import { auth } from "~~/server/auth/auth";

const isUserComplete = (user: any) => {
  return !!(
    user.birthDate &&
    user.street &&
    user.postalCode &&
    user.town &&
    user.phone
  );
};

export default defineNuxtPlugin(async (_nuxtApp) => {
  const userStore = useUserStore();
  const headers = useRequestHeaders();

  const result = await auth.api.getSession({
    headers: headers,
  });

  if (!result || !result.session) return;

  const { user } = await $fetch("/api/users/me", {
    headers: headers,
  });

  if (!user) return;

  if (!isUserComplete(user)) {
    const url = useNuxtApp().ssrContext?.url;
    if (url !== "/auth/register?completion=true") {
      await navigateTo("/auth/register?completion=true");
      return;
    }
  }

  await userStore.$patch({
    user,
    impersonated: !!result.session.impersonatedBy,
  });
});
