import { defineStore } from "pinia";
import { translateRole } from "./helpers/translate.js";
import { formatSlovakDate } from "./helpers/utilities.js";

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
    supervisor: null,
    supervisorEmail: null,
    seasons: [],
    awards: [],
    clubManager: false,
    dev: false,
    cookies: null,
  }),
  getters: {
    /**
     * Get the full name of the user.
     * @returns {string|null} The full name of the user or null if the user id is null.
     */
    fullName() {
      return this.uid ? `${this.name} ${this.surname}` : null;
    },
    formattedBirthdate() {
      return this.birthdate ? formatSlovakDate(this.birthdate) : null;
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
        { name: "birthdate", value: this.formattedBirthdate },
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
    /**
     * Get pure user data.
     * @returns {Object} The user data.
     */
    userData() {
      return {
        uid: this.uid,
        provider: this.provider,
        name: this.name,
        surname: this.surname,
        email: this.email,
        role: this.role,
        club: this.club,
        address: this.address,
        phone: this.phone,
        birthdate: this.birthdate,
        supervisor: this.supervisor,
        supervisorEmail: this.supervisorEmail,
        seasons: this.seasons,
        awards: this.awards,
        clubManager: this.clubManager,
        dev: this.dev,
      };
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
     * @param {string} supervisor - The supervisor.
     * @param {string} supervisorEmail - The supervisor email.
     * @param {Array} seasons - The seasons.
     * @param {Array} awards - The awards.
     * @param {boolean} clubManager - The club manager status.
     * @param {boolean} dev - The developer program status.
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
      supervisor,
      supervisorEmail,
      seasons,
      awards,
      clubManager,
      dev,
      cookies,
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
      this.supervisor = supervisor || null;
      this.supervisorEmail = supervisorEmail || null;
      this.seasons = seasons || [];
      this.awards = awards || [];
      this.clubManager = clubManager || false;
      this.dev = dev || false;
      this.cookies = cookies || null;
    },
    /**
     * Update user data in the store.
     * @param {Object} userData - Partial or full user data to update.
     */
    updateUser(userData) {
      Object.keys(userData).forEach((key) => {
        if (key in this) {
          this[key] = userData[key];
        }
      });
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
      this.clubManager = false;
      this.dev = false;
      this.cookies = null;
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
    headerMessage: null,
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
    initialize(messages, headerMessage) {
      this.messages = messages;
      this.initialized = true;
      this.headerMessage = headerMessage;
    },
    dismissHeaderMessage() {
      this.headerMessage = null;
    },
  },
});

export const useEventsStore = defineStore("event", {
  state: () => ({
    initialized: false,
    events: [],
  }),
  getters: {},
  actions: {
    /**
     * Initialize the events.
     */
    initialize(events) {
      this.events = events;
      this.initialized = true;
    },
    /**
     * Add an event to the events.
     */
    async addEvent(event) {
      // Convert the thumbnail to a download URL
      if (event.thumbnail) {
        const { getThumbnail } = await import("./firebase/events.js");
        event.originalThumbnail = event.thumbnail;
        event.thumbnail = await getThumbnail(event.thumbnail);
      }
      this.events.push(event);
      this.events.sort((a, b) => a.beginningDate - b.beginningDate);
    },
    async updateEvent(event) {
      // Convert the thumbnail to a download URL
      if (event.thumbnail) {
        const { getThumbnail } = await import("./firebase/events.js");
        event.originalThumbnail = event.thumbnail;
        event.thumbnail = await getThumbnail(event.thumbnail);
      }
      this.events = this.events.map((e) => (e.id === event.id ? event : e));
      this.events.sort((a, b) => a.beginningDate - b.beginningDate);
    },
  },
});
