import { defineStore } from "pinia";
import type { User } from "#shared/types/user";

export const useUserStore = defineStore("user", {
  state: (): { user: User | null } => ({ user: null }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    isCompleteUser: (state) =>
      state.user !== null &&
      [state.user.birthdate, state.user.address, state.user.name].every(
        (field) => field !== undefined && field !== null,
      ),
    firstName: (state) => state.user?.name?.split(" ")[0] ?? "",
    isMember: (state) =>
      state.user?.clubMemberships?.some(
        (membership) =>
          membership.season === new Date().getFullYear().toString() &&
          membership.confirmed,
      ),
    isMemberCandidate: (state) =>
      state.user?.clubMemberships?.some(
        (membership) =>
          membership.season === new Date().getFullYear().toString() &&
          !membership.confirmed,
      ),
  },
  actions: {
    async set() {
      const { data } = await useFetch<User>("api/users/me");
      this.user = (data?.value ?? null) as User | null;
    },
    clear() {
      console.log("Clearing user");
      this.user = null;
    },
  },
});
