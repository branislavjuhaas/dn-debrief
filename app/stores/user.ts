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
    isMember(state) {
      const currentYear = new Date().getFullYear();
      return state.user?.clubMemberships?.some((m) => m.season === currentYear);
    },
    isConfirmedMember(state) {
      const currentYear = new Date().getFullYear();
      return state.user?.clubMemberships?.some(
        (m) => m.season === currentYear && m.confirmed,
      );
    },
  },
  actions: {
    async addClubMemberships(memberships: ClubMembership[]) {
      if (!this.user) return;
      this.user.clubMemberships = [
        ...(this.user.clubMemberships ?? []),
        ...memberships,
      ];
    },
  },
});
