import { defineStore } from "pinia";
import type { User } from "#shared/types/user";

export const useUserStore = defineStore("user", {
  state: (): { user: User | null; impersonation: boolean } => ({
    user: null,
    impersonation: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isCompleteUser: (state) =>
      !!(
        state.user &&
        state.user.birthdate &&
        state.user.street &&
        state.user.postalCode &&
        state.user.city &&
        state.user.phone
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
      const { user } = await $fetch("/api/users/me", {
        headers,
        credentials: "include",
      });
      this.user = (user as unknown as User) ?? null;
      this.impersonation = impersonation ?? false;
    },
    clear() {
      this.user = null;
      this.impersonation = false;
    },
  },
});
