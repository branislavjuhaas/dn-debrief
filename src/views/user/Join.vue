<script setup>
import Field from "../../components/Field.vue";
import { useUserStore } from "../../stores.js";
import Dropdown from "../../components/Dropdown.vue";
import router from "../../router.js";
import { onMounted, ref, computed, watch } from "vue";
import { getClubs } from "../../firebase/structure.js";

let clubsData = ref([]);

onMounted(async () => {
  clubsData.value = await getClubs(false);
});

const clubNames = computed(() => clubsData.value.map((club) => club.name));

let selectedClub = null;

const club = ref("");
const birthdate = ref("");
const address = ref("");
const phone = ref("");

const adult = ref(true);

const supervisor = ref("");
const mail = ref("");

const canSubmit = ref(false);

let seasons = [];

watch(club, (newClubName) => {
  selectedClub = clubsData.value.find((club) => club.name === newClubName);
});

// If the current date is beyond the 1st of September, the current season is this and the next one, otherwise it is only the current one
const now = new Date();
if (now.getMonth() >= 8) {
  seasons.push(now.getFullYear().toString());
  seasons.push((now.getFullYear() + 1).toString());
} else {
  seasons.push(now.getFullYear().toString());
}

console.log(seasons);

const userStore = useUserStore();

const register = async () => {
  userStore.club = club;
  userStore.address = address;
  userStore.phone = phone;
  userStore.birthdate = birthdate;

  let seasonsString = [];

  for (let season of userStore.seasons) {
    seasonsString.push(season);
  }

  for (let season of seasons) {
    seasonsString.push({ year: season, confirmed: false });
  }

  console.log(seasonsString);
  console.log(adult);

  if (adult.value) {
    const { joinAdultUser } = await import("../../firebase/auth.js");
    await joinAdultUser(
      userStore.uid,
      selectedClub,
      address.value,
      phone.value,
      birthdate.value,
      seasonsString,
    );
  } else {
    const { joinUser } = await import("../../firebase/auth.js");
    await joinUser(
      userStore.uid,
      selectedClub,
      address.value,
      phone.value,
      birthdate.value,
      seasonsString,
      mail.value,
      supervisor.value,
    );
  }

  // Redirect to the user profile
  await router.push("/profile");
};

// Watch changing of the date of birth
watch(birthdate, (birthdate) => {
  // Check if the user is at least 18 years old, be sure to consider the month and day
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
  console.log(adult.value);
});

// Watch the club, birthdate, street, postal, and municipality fields, if the adult is checked, and if the supervisor and mail fields are filled
// If adult is checked, the supervisor and mail fields are required, otherwise they are not
watch(
  [club, birthdate, address, adult, supervisor, mail, phone],
  ([club, birthdate, address, adult, supervisor, mail, phoneNumber]) => {
    if (
      !adult &&
      (club === "" ||
        birthdate === "" ||
        address === "" ||
        supervisor === "" ||
        mail === "" ||
        phoneNumber === "")
    )
      canSubmit.value = false;
    else
      canSubmit.value = !(
        adult &&
        (club === "" ||
          birthdate === "" ||
          address === "" ||
          phoneNumber === "")
      );
  },
);
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{ "Registrácia do SDA na sezónu " + seasons.join("/") }}
    </h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <dropdown
          name="club"
          v-model="club"
          label="Debatný klub"
          type="dropdown"
          :options="clubNames" />
        <field
          name="address"
          v-model="address"
          label="Celá adresa"
          type="text"
          placeholder="Ventúrska 5, 811 01 Bratislava" />
        <field
          name="birthdate"
          v-model="birthdate"
          label="Dátum narodenia"
          type="date" />
        <field
          name="phoneNumber"
          v-model="phone"
          label="Telefónne číslo"
          type="tel" />
        <field
          v-if="!adult"
          name="supervisor"
          v-model="supervisor"
          label="Celé meno zákonného zástupcu"
          type="text" />
        <field
          v-if="!adult"
          name="mail"
          v-model="mail"
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

<style scoped>
.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}
</style>
