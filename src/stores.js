import { defineStore } from "pinia";
import { translateRole } from "./translate.js";

export const useUserStore = defineStore("user", {
  state: () => ({
    uid: null,
    provider: null,
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
    additionalDataArray() {
      return [
        { name: "uid", value: this.uid },
        { name: "provider", value: this.provider },
        { name: "name", value: this.name },
        { name: "surname", value: this.surname },
        { name: "email", value: this.email },
        { name: "role", value: translateRole(this.role) },
      ].filter((item) => item.value !== null && item.value !== undefined);
    },
  },
  actions: {
    setUser(uid, provider, email, name, surname, role) {
      this.uid = uid;
      this.provider = provider;
      this.email = email;
      this.name = name;
      this.surname = surname;
      this.role = role || "user";
    },
    logOut() {
      this.uid = null;
      this.provider = null;
      this.name = null;
      this.surname = null;
      this.email = null;
      this.role = null;
    },
  },
});
