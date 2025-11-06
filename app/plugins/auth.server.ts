import { auth } from "~~/server/auth/auth";

export default defineNuxtPlugin(async (nuxtApp) => {
  const userStore = useUserStore();
  const headers = useRequestHeaders(["cookie"]);

  const session = await auth.api.getSession({
    headers: headers,
  });

  if (!session) {
    return;
  }

  userStore.set(session.user || null);
});
