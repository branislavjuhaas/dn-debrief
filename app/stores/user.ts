import { defineStore } from "pinia";
import type { User } from "#shared/types/user";
import type { ApiResponse } from "#shared/types/response";

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
    async set(headers?: HeadersInit) {
      const { data } = await $fetch<ApiResponse<User>>("/api/users/me", {
        headers,
        credentials: "include",
      });
      this.user = data ?? null;
    },
    clear() {
      console.log("Clearing user");
      this.user = null;
    },
  },
});
