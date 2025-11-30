import { auth } from "~~/server/auth/auth";

export default defineNuxtPlugin(async (_nuxtApp) => {
  const userStore = useUserStore();
  const headers = useRequestHeaders(["cookie"]);

  const session = await auth.api.getSession({
    headers: headers,
  });

  if (!session) {
    return;
  }

  await userStore.set(headers, session.session.impersonatedBy !== null);
});
