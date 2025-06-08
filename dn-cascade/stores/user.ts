import type { User } from "~/types/user";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.user?.id || null,
    authId: (state) => state.user?.auth_id || null,
    fullName: (state) =>
      state.user ? `${state.user?.name} ${state.user?.surname}`.trim() : null,
  },
  actions: {
    async fetchUserData(authId: string) {
      const supabase = useSupabaseClient();

      const { data, error } = await supabase
        .from("users")
        .select(
          "*, details(*), claims(*), memberships(*, club_name:club_id(name))",
        )
        .eq("auth_id", authId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        this.user = null;
        return;
      }

      this.user = data as User;
    },
    async clearUserData() {
      this.user = null;
    },
  },
});
