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
    setUser(uid, name, surname, email, role) {
      this.uid = uid;
      this.name = name;
      this.surname = surname;
      this.email = email;
      this.role = role;
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
