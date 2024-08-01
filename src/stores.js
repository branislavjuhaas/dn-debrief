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
    setUser(uid, email, name, surname, role) {
      this.uid = uid;
      this.email = email;
      this.name = name;
      this.surname = surname;
      this.role = role || "user";
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
