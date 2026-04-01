import { auth } from "~~/server/auth/auth";

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

  await userStore.$patch({
    user,
    impersonated: !!result.session.impersonatedBy,
  });
});
