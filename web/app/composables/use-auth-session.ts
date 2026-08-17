export const useAuthSession = () => {
  return useAsyncData("auth-session", () =>
    useAuthClient().getSession({
      fetchOptions: {
        headers: useRequestHeaders(["cookie"]) as Record<string, string>,
      },
    }),
  );
};
