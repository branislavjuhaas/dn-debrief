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
  },
  actions: {
    set(user: User | null) {
      this.user = user;
    },
    clear() {
      console.log("Clearing user");
      this.user = null;
    },
  },
});
