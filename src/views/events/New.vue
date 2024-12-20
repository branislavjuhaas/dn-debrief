<script setup>
import Thumbnail from "../../components/Thumbnail.vue";
import { ref, watch } from "vue";
import Field from "../../components/Field.vue";
import Schedule from "../../components/Schedule.vue";
const thumbnailRef = ref(null);

const handName = ref(false);

const id = ref("");
const name = ref("");
const beginning = ref("");
const description = ref("");
const city = ref("");
const address = ref("");
const price = ref(30);
const motion = ref("Všetky tézy tohoto turnaja sú improvizované");

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
      return `${regionalTranscendence(numerals)}. západoslovenský regionálny turnaj`;
    case "SS":
      return `${regionalTranscendence(numerals)}. stredoslovenský regionálny turnaj`;
    case "SV":
      return `${regionalTranscendence(numerals)}. východoslovenský regionálny turnaj`;
    case "SC":
      return `Celoslovenský turnaj 20${numerals.slice(0, 2)}`;
    case "SN":
      return `${numerals.slice(2)}. začiatočnícky turnaj 20${numerals.slice(0, 2)}`;
    case "RS":
      return `${numerals.slice(2)}. rozhodcovský seminár 20${numerals.slice(0, 2)}`;
    case "DS":
      return `${numerals.slice(2)}. dobrovoľnícky seminár 20${numerals.slice(0, 2)}`;
    case "TS":
      return `${numerals.slice(2)}. trénerský seminár 20${numerals.slice(0, 2)}`;
    case "US":
      return `${numerals.slice(2)}. učiteľský seminár 20${numerals.slice(0, 2)}`;
    case "VZ":
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
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Vytvoriť podujatie</h1>
    <div
      class="flex flex-col sm:grid sm:grid-cols-[auto_1fr] w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-4 transition-all">
      <Field v-model="id" label="ID" class="col-start-1 row-start-1" />
      <Field
        v-model="name"
        label="Názov"
        @keyup="handName = true"
        class="col-start-2 row-start-1" />
      <div
        class="col-start-1 self-center row-start-2 overflow-hidden rounded-[1.25rem] w-[26.875rem]">
        <thumbnail
          ref="thumbnailRef"
          :name="name"
          :beginning-date="beginning"
          :end-date="'2025-02-11'"
          :city="city"
          :id="id" />
      </div>
      <Field
        v-model="description"
        label="Popis"
        type="multiline"
        class="col-start-2 row-start-2" />
      <Field v-model="city" label="Mesto" class="col-start-1 row-start-3" />
      <Field
        v-model="beginning"
        label="Začiatok podujatia"
        type="date"
        class="col-start-2 row-start-3" />
      <Field
        v-model="address"
        label="Adresa podujatia"
        class="col-start-1 row-start-4 col-span-full" />
      <Field
        v-model="price"
        label="Cena"
        type="number"
        class="col-start-1 row-start-5 col-span-full" />
      <Field
        v-model="motion"
        label="Téza"
        class="col-start-1 row-start-6 col-span-full" />
      <Schedule
        v-model="schedule"
        class="col-start-1 row-start-7 col-span-full" />
    </div>
  </div>
</template>

<style scoped></style>
