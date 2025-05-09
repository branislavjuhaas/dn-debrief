import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
  state: () => ({
    loadings: 0,
  }),
  getters: {
    loading(): boolean {
      return this.loadings > 0;
    },
  },
  actions: {
    loadingStart() {
      this.loadings++;
    },
    loadingEnd() {
      this.loadings--;
    },
  },
});
