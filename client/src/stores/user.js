import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({ uid: null, name: null, email: null, surname: null }),
  getters: {
    fullName() {
      // if uid null return null
      return this.uid ? `${this.uid}` : null;
    },
  },
  actions: {
    setUser(uid, name, surname) {
      this.uid = uid;
      this.name = name;
      this.surname = surname;
    },
    logOut() {
      this.user = null;
    },
  },
});
