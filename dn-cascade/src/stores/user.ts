import { defineStore } from "pinia";
import type { User, Role, Supervisor, Season } from "../types/user";
import type { Club } from "../types/club";

export const useUserStore = defineStore("user", {
  state: () => ({
    id: "",
    email: "",
    name: "",
    surname: "",
    role: undefined as Role | undefined,
    club: undefined as Club | undefined,
    address: undefined as string | undefined,
    phone: undefined as string | undefined,
    birthDate: undefined as Date | undefined,
    supervisor: undefined as Supervisor | undefined,
    seasons: undefined as Season[] | undefined,
    clubManager: undefined as boolean | undefined,
    dev: undefined as boolean | undefined,
    cookies: undefined as boolean | undefined,
    createdAt: new Date(),
  }),
  getters: {
    fullName: (state) => {
      return `${state.name} ${state.surname}`;
    }
  },
  actions: {
    setUser(user: User) {
      this.id = user.id;
      this.email = user.email;
      this.name = user.name;
      this.surname = user.surname;
      this.role = user.role;
      this.club = user.club;
      this.address = user.address;
      this.phone = user.phone;
      this.birthDate = user.birthDate;
      this.supervisor = user.supervisor;
      this.seasons = user.seasons;
      this.clubManager = user.clubManager;
      this.dev = user.dev;
      this.cookies = user.cookies;
      this.createdAt = user.createdAt;
    },
    clearUser() {
      this.id = "";
      this.email = "";
      this.name = "";
      this.surname = "";
      this.role = undefined;
      this.club = undefined;
      this.address = undefined;
      this.phone = undefined;
      this.birthDate = undefined;
      this.supervisor = undefined;
      this.seasons = undefined;
      this.clubManager = undefined;
      this.dev = undefined;
      this.cookies = undefined;
      this.createdAt = new Date();
    },
  },
});
