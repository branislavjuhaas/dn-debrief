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
    club: null,
    address: null,
    phone: null,
    birthdate: null,
    seasons: [],
    awards: [],
  }),
  getters: {
    fullName() {
      // if uid null return null
      return this.uid ? `${this.name} ${this.surname}` : null;
    },
    additionalDataArray() {
      return [
        { name: "uid", value: this.uid },
        { name: "role", value: translateRole(this.role) },
        { name: "club", value: this.club ? this.club.name : null },
        { name: "address", value: this.address },
        { name: "phone", value: this.phone },
        { name: "birthdate", value: this.birthdate },
      ].filter((item) => item.value !== null && item.value !== undefined);
    },
    isMember() {
      return (
        // Role cannot be null and the seasons has to contain a map where the year is the current year and the confirmed is true
        this.role !== null &&
        this.seasons.some(
          (season) =>
            season.year === new Date().getFullYear().toString() &&
            season.confirmed,
        )
      );
    },
    isJoining() {
      return (
        // Role cannot be null and the seasons has to contain a map where the year is the current year and the confirmed is false
        this.role !== null &&
        this.seasons.some(
          (season) => season.year === new Date().getFullYear().toString(),
        )
      );
    },
  },
  actions: {
    setUser(
      uid,
      provider,
      email,
      name,
      surname,
      role,
      club,
      address,
      phone,
      birthdate,
      seasons,
      awards,
    ) {
      this.uid = uid;
      this.provider = provider;
      this.email = email;
      this.name = name;
      this.surname = surname;
      this.role = role || "user";
      this.club = club || null;
      this.address = address || null;
      this.phone = phone || null;
      this.birthdate = birthdate || null;
      this.seasons = seasons || [];
      this.awards = awards || [];
    },
    logOut() {
      this.uid = null;
      this.provider = null;
      this.name = null;
      this.surname = null;
      this.email = null;
      this.role = null;
      this.club = null;
      this.address = null;
      this.phone = null;
      this.birthdate = null;
      this.seasons = [];
      this.awards = [];
    },
    addSeason(season) {
      this.seasons.push(season);
    },
  },
});

export const useLoadingStore = defineStore("loading", {
  state: () => ({
    loadings: 0,
  }),
  getters: {
    loading() {
      return this.loadings > 0;
      //return false;
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
