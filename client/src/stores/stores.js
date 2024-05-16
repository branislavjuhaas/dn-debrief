import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    uid: null,
    name: null,
    surname: null,
    email: null,
    role: null,
  }),
  getters: {
    fullName() {
      // if uid null return null
      return this.uid ? `${this.name} ${this.surname}` : null;
    },
  },
  actions: {
    setUser(uid, email, user) {
      this.uid = uid;
      this.email = email;
      this.name = user.name;
      this.surname = user.surname;
      this.role = user.role;
    },
    logOut() {
      this.uid = null;
      this.name = null;
      this.surname = null;
      this.email = null;
      this.role = null;
    },
  },
});

export const useStatesStore = defineStore("states", {
  state: () => ({ loading: false }),
  actions: {
    startLoading() {
      this.loading = true;
    },
    stopLoading() {
      this.loading = false;
    },
  },
});
