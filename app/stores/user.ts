import type { User } from "#shared/types/user";

// TODO: Implement https://pinia.vuejs.org/core-concepts/state.html#TypeScript

export const useUserStore = defineStore("user", {
  state: (): { user: User | null; impersonated: boolean } => {
    return {
      user: null,
      impersonated: false,
    };
  },
  getters: {
    fullName(state) {
      return `${state.user?.name} ${state.user?.surname}`;
    },
    isAuthenticated(state) {
      return state.user != null;
    },
  },
});
