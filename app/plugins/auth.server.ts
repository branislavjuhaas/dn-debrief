import { auth } from "~~/server/auth/auth";

export default defineNuxtPlugin(async (_nuxtApp) => {
  const userStore = useUserStore();
  const headers = useRequestHeaders();

  const session = await auth.api.getSession({
    headers: headers,
  });

  if (!session) {
    return;
  }

  console.log(JSON.stringify(_nuxtApp.ssrContext));

  await userStore.set(session.session.impersonatedBy !== null, headers);
});
