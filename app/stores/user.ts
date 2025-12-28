import { defineStore } from "pinia";
import type { User } from "#shared/types/user";

export const useUserStore = defineStore("user", {
  state: (): { user: User | null; impersonation: boolean } => ({
    user: null,
    impersonation: false,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    isCompleteUser: (state) =>
      state.user !== null &&
      [state.user.birthdate, state.user.address, state.user.name].every(
        (field) => field !== undefined && field !== null,
      ),
    fullName: (state) =>
      state.user ? `${state.user.name} ${state.user.surname}` : "",
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
    async set(impersonation?: boolean, headers?: HeadersInit) {
      const { data } = await $fetch("/api/users/me", {
        headers,
        credentials: "include",
      });
      this.user = data ?? null;
      this.impersonation = impersonation ?? false;
    },
    clear() {
      console.log("Clearing user");
      this.user = null;
      this.impersonation = false;
    },
  },
});
