<script setup>
import Thumbnail from "../../components/Thumbnail.vue";
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import Field from "../../components/Field.vue";
import Schedule from "../../components/Schedule.vue";
import { useUserStore } from "../../stores.js";
import { getPotentialOrganizers } from "../../firebase/events.js";
import Toggle from "../../components/Toggle.vue";

const thumbnailRef = ref(null);

const handName = ref(false);

const tournament = ref(true);

const id = ref("");
const name = ref("");
const beginning = ref("");
const description = ref("");
const city = ref("");
const address = ref("");
const price = ref(30);
const motion = ref("Všetky tézy tohoto turnaja sú improvizované");

const potentialOrganizers = ref([]);

const userStore = useUserStore();

const schedule = ref({
  days: [
    {
      beginning: 810,
      points: [
        {
          name: "otvorenie podujatia",
          duration: 30,
        },
      ],
    },
  ],
});

const ending = computed(() => {
  // beginning with the schedule.days days added
  const date = new Date(beginning.value);
  const days = schedule.value.days.length - 1;
  date.setDate(date.getDate() + days);

  return date;
});

const regionalTranscendence = (numeral) => {
  // get the last character of the numeral, if 1, return 2, if 2, return 3, if 3, return 1
  const lastChar = numeral.slice(-1);
  switch (lastChar) {
    case "1":
      return "2";
    case "2":
      return "3";
    case "3":
      return "1";
    default:
      return null;
  }
};

const suggestName = (input) => {
  // split the id to get the first 2 characters and the rest, use fixed length for the first part
  if (input.length !== 5) return null;

  const [code, numerals] = [input.slice(0, 2).toUpperCase(), input.slice(2)];

  // if the code contains numbers or the numerals contain letters, return null
  if (!/^[A-Za-z]+$/.test(code) || !/^\d+$/.test(numerals)) return null;

  console.log(code, numerals);

  switch (code) {
    case "SZ":
      tournament.value = true;
      return `${regionalTranscendence(numerals)}. západoslovenský regionálny turnaj`;
    case "SS":
      tournament.value = true;
      return `${regionalTranscendence(numerals)}. stredoslovenský regionálny turnaj`;
    case "SV":
      tournament.value = true;
      return `${regionalTranscendence(numerals)}. východoslovenský regionálny turnaj`;
    case "SC":
      tournament.value = true;
      return `Celoslovenský turnaj 20${numerals.slice(0, 2)}`;
    case "SN":
      tournament.value = true;
      return `${numerals.slice(2)}. začiatočnícky turnaj 20${numerals.slice(0, 2)}`;
    case "RS":
      tournament.value = false;
      return `${numerals.slice(2)}. rozhodcovský seminár 20${numerals.slice(0, 2)}`;
    case "DS":
      tournament.value = false;
      return `${numerals.slice(2)}. dobrovoľnícky seminár 20${numerals.slice(0, 2)}`;
    case "TS":
      tournament.value = false;
      return `${numerals.slice(2)}. trénerský seminár 20${numerals.slice(0, 2)}`;
    case "US":
      tournament.value = false;
      return `${numerals.slice(2)}. učiteľský seminár 20${numerals.slice(0, 2)}`;
    case "VZ":
      tournament.value = false;
      return `Valné zhromaždenie 20${numerals.slice(0, 2)}`;
    default:
      return null;
  }
};

watch(id, () => {
  if (!handName.value) {
    console.log("suggesting name");
    name.value = suggestName(id.value);
  }
});

const fetchPotentialOrganizers = async () => {
  console.log(userStore);

  try {
    const organizers = await getPotentialOrganizers();
    console.log(organizers);
    potentialOrganizers.value = [
      ...organizers
        .filter((organizer) => organizer.uid !== userStore.uid)
        .map((organizer) => ({ ...organizer, selected: false })),
      { ...userStore.userData, self: true, selected: true },
    ];

    // Sort the potential organizers by surname alphabetically
    potentialOrganizers.value.sort((a, b) =>
      a.surname.localeCompare(b.surname),
    );

    console.log(potentialOrganizers.value);
  } catch (error) {
    console.error("Error fetching potential organizers:", error);
  }
};

watchEffect(() => {
  if (userStore.uid != null) {
    console.log("refetching organizers");
    fetchPotentialOrganizers();
  }
});

onMounted(() => {
  if (userStore.uid != null) {
    console.log("refetching organizers");
    fetchPotentialOrganizers();
  }
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Vytvoriť podujatie</h1>
    <div
      class="flex flex-col w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-4 transition-all">
      <div class="grid grid-cols-2 gap-4">
        <div
          class="flex font-bold h-16 min-w-60 px-5 rounded-[1.25rem] border-2 border-black duration-500 items-center justify-center vertical-center text-black cursor-pointer transition-colors"
          :class="{ 'bg-black text-white': tournament }"
          @click="tournament = true">
          <p>Súťažné podujatie</p>
        </div>
        <div
          class="flex font-bold h-16 min-w-60 px-5 rounded-[1.25rem] border-2 border-black duration-500 items-center justify-center vertical-center text-black cursor-pointer transition-colors"
          :class="{ 'bg-black text-white': !tournament }"
          @click="tournament = false">
          <p>Nesúťažné podujatie</p>
        </div>
      </div>
      <Field v-model="id" label="ID" />
      <Field v-model="name" label="Názov" @keyup="handName = true" />
      <div class="grid grid-cols-[auto_1fr] gap-4">
        <div
          class="self-center overflow-hidden rounded-[1.25rem] w-[26.875rem]">
          <thumbnail
            ref="thumbnailRef"
            :name="name"
            :beginning-date="beginning"
            :end-date="ending"
            :city="city"
            :id="id" />
        </div>
        <Field v-model="description" label="Popis" type="multiline" />
      </div>
      <Field v-model="beginning" label="Začiatok podujatia" type="date" />
      <Field v-model="city" label="Mesto" />
      <Field v-model="address" label="Adresa podujatia" />
      <Field v-model="price" label="Cena" type="number" />
      <Field v-model="motion" label="Téza" v-if="tournament" />
      <Schedule v-model="schedule" />
      <div
        class="flex flex-col w-full h-max-60 border-black border-2 rounded-[1.25rem] px-5 py-3 text-black gap-4">
        <h2 class="font-bold">Organizátori/-ky podujatia</h2>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
          <div v-for="organizer in potentialOrganizers" :key="organizer.uid">
            <toggle
              v-model="organizer.selected"
              :readonly="organizer.self"
              :label="organizer.name + ' ' + organizer.surname"
              :secondary="organizer.email"
              :sublabel="organizer.email" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
