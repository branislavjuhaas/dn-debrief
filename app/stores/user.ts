import { defineStore } from "pinia";
import type { User } from "better-auth";

export const useUserStore = defineStore("user", {
  state: (): { user: User | null } => ({ user: null }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
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
