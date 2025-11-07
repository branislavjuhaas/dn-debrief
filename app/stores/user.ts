import { defineStore } from "pinia";
import type { User } from "better-auth";

export const useUserStore = defineStore("user", {
  state: (): { user: User | null } => ({ user: null }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    isCompleteUser: (state) =>
      state.user !== null &&
      [
        (state.user as any).birthdate,
        (state.user as any).address,
        (state.user as any).name,
      ].every((field) => field !== undefined && field !== null),
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
