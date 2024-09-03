import { defineStore } from "pinia";
import { translateRole } from "./translate.js";

/**
 * User store definition.
 * @type {Object}
 */
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
    /**
     * Get the full name of the user.
     * @returns {string|null} The full name of the user or null if the user id is null.
     */
    fullName() {
      return this.uid ? `${this.name} ${this.surname}` : null;
    },
    /**
     * Get an array of additional user data.
     * @returns {Array} An array of objects with name and value properties.
     */
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
    /**
     * Check if the user is a member.
     * @returns {boolean} True if the user is a member, false otherwise.
     */
    isMember() {
      return (
        this.role !== null &&
        this.seasons.some(
          (season) =>
            season.year === new Date().getFullYear().toString() &&
            season.confirmed,
        )
      );
    },
    /**
     * Check if the user is joining.
     * @returns {boolean} True if the user is joining, false otherwise.
     */
    isJoining() {
      return (
        this.role !== null &&
        this.seasons.some(
          (season) => season.year === new Date().getFullYear().toString(),
        )
      );
    },
  },
  actions: {
    /**
     * Set the user data.
     * @param {string} uid - The user id.
     * @param {string} provider - The provider.
     * @param {string} email - The email.
     * @param {string} name - The name.
     * @param {string} surname - The surname.
     * @param {string} role - The role.
     * @param {string} club - The club.
     * @param {string} address - The address.
     * @param {string} phone - The phone number.
     * @param {string} birthdate - The birthdate.
     * @param {Array} seasons - The seasons.
     * @param {Array} awards - The awards.
     */
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
    /**
     * Log out the user.
     */
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
    /**
     * Add a season to the user's seasons.
     * @param {Object} season - The season to add.
     */
    addSeason(season) {
      this.seasons.push(season);
    },
  },
});

/**
 * Loading store definition.
 * @type {Object}
 */
export const useLoadingStore = defineStore("loading", {
  state: () => ({
    loadings: 0,
  }),
  getters: {
    /**
     * Check if the application is loading.
     * @returns {boolean} True if the application is loading, false otherwise.
     */
    loading() {
      return this.loadings > 0;
    },
  },
  actions: {
    /**
     * Start a loading operation.
     */
    loadingStart() {
      this.loadings++;
    },
    /**
     * End a loading operation.
     */
    loadingEnd() {
      this.loadings--;
    },
  },
});

export const useFeedStore = defineStore("feed", {
  state: () => ({
    initialized: false,
    messages: [],
  }),
  getters: {
    /**
     * Get the feed messages.
     * @returns {Array} The feed messages.
     */
    feedMessages() {
      return this.messages;
    },
  },
  actions: {
    /**
     * Initialize the feed messages.
     */
    initialize(messages) {
      this.messages = messages;
      this.initialized = true;
    },
  },
});
