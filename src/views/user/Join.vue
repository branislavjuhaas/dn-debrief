<script setup>
// Importing necessary components and libraries
import Field from "../../components/Field.vue";
import Dropdown from "../../components/Dropdown.vue";
import { useUserStore } from "../../stores.js";
import { onMounted, ref, computed, watch } from "vue";
import { getClubs, joinAdultUser, joinUser } from "../../firebase/structure.js";
import router from "../../router.js";

// Initializing user store
const userStore = useUserStore();

// If the user was registered in previous season
const wasRegistered = userStore.seasons.some(
  (season) => season.year === (new Date().getFullYear() - 1).toString(),
);

// State variables
const club = ref("");
const birthdate = ref("");
const address = ref("");
const phone = ref("");
const adult = ref(true);

// State variables for non-adult users
const supervisor = ref("");
const mail = ref("");

// Fetch clubs data on component mount
let clubsData = ref([]);
onMounted(async () => {
  clubsData.value = await getClubs(false);
});

// Compute club names from clubs data
const clubNames = computed(() => clubsData.value.map((club) => club.name));

// Compute whether the form can be submitted
const canSubmit = computed(() => {
  if (!adult.value) {
    return (
      club.value &&
      birthdate.value &&
      address.value &&
      supervisor.value &&
      mail.value &&
      phone.value
    );
  } else {
    return club.value && birthdate.value && address.value && phone.value;
  }
});

// Watch for changes in club selection
let selectedClub = null;
watch(club, (newClubName) => {
  selectedClub = clubsData.value.find((club) => club.name === newClubName);
});

// Compute the current and next season
const now = new Date();
const seasons =
  now.getMonth() >= 8
    ? [now.getFullYear().toString(), (now.getFullYear() + 1).toString()]
    : [now.getFullYear().toString()];

// Watch for changes in birthdate to determine if user is an adult
watch(birthdate, (birthdate) => {
  const birthdateDate = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - birthdateDate.getFullYear();
  if (
    now.getMonth() < birthdateDate.getMonth() ||
    (now.getMonth() === birthdateDate.getMonth() &&
      now.getDate() < birthdateDate.getDate())
  ) {
    age--;
  }
  adult.value = age >= 18;
});

/**
 * Function to register a user
 * @returns {Promise<void>} - Promise to handle user registration
 */
const register = async () => {
  const birthdateDate = new Date(birthdate.value);
  const birthdateString = `${birthdateDate.getDate()}. ${birthdateDate.getMonth() + 1}. ${birthdateDate.getFullYear()}`;

  // Only add new seasons to the user's seasons array
  const seasonsString = [
    ...userStore.seasons,
    ...seasons.map((season) => ({ year: season, confirmed: false })),
  ].filter(
    (season, index, self) =>
      index ===
      self.findIndex(
        (t) => t.year === season.year && t.confirmed === season.confirmed,
      ),
  );

  userStore.club = club;
  userStore.address = address;
  userStore.phone = phone;
  userStore.birthdate = ref(birthdateString);
  userStore.seasons = seasonsString;

  if (adult.value) {
    await joinAdultUser(
      userStore.uid,
      selectedClub,
      address.value,
      phone.value,
      birthdateString,
      seasonsString,
    );
  } else {
    await joinUser(
      userStore.uid,
      selectedClub,
      address.value,
      phone.value,
      birthdateString,
      seasonsString,
      supervisor.value,
      mail.value,
    );
  }

  await router.push({
    name: "Pay",
    query: {
      subject: "registracia",
      subacc: "registráciu do SDA",
      amount: wasRegistered ? "5" : "8",
    },
  });
};
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{ "Registrácia do SDA na sezónu " + seasons.join("/") }}
    </h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Dropdown
          name="club"
          v-model.trim="club"
          label="Debatný klub"
          type="dropdown"
          :options="clubNames" />
        <Field
          name="address"
          v-model.trim="address"
          label="Celá adresa"
          type="text"
          placeholder="Ventúrska 5, 811 01 Bratislava" />
        <Field
          name="birthdate"
          v-model.trim="birthdate"
          label="Dátum narodenia"
          type="date" />
        <Field
          name="phoneNumber"
          v-model.trim="phone"
          label="Telefónne číslo"
          type="tel" />
        <Field
          v-if="!adult"
          name="supervisor"
          v-model.trim="supervisor"
          label="Celé meno zákonného zástupcu"
          type="text" />
        <Field
          v-if="!adult"
          name="mail"
          v-model.trim="mail"
          label="E-mail zákonného zástupcu"
          type="email" />
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center sm:grid-rows-1 sm:grid-cols-[1fr_auto]">
        <button
          :disabled="!canSubmit"
          @click="register"
          class="form-primary vertical-center col-start-1 sm:col-start-2">
          <span>Registrovať</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
