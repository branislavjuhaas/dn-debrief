<script setup>
import Thumbnail from "../../components/Thumbnail.vue";
import { computed, onMounted, ref, watch, watchEffect, nextTick } from "vue";
import Field from "../../components/Field.vue";
import Schedule from "../../components/Schedule.vue";
import { useEventsStore, useLoadingStore, useUserStore } from "../../stores.js";
import {
  getEventById,
  getPotentialOrganizers,
  setEvent,
} from "../../firebase/events.js";
import Toggle from "../../components/Toggle.vue";
import router from "../../router.js";
import { useRoute } from "vue-router";

const props = defineProps(["edit"]);

const edit = props.edit;

// if edit, get the :id from the route
const editEventId = edit ? useRoute().params.id : null;

/**
 * A reactive reference to the thumbnail component
 * @type {import("vue").Ref<null|object>}
 */
const thumbnailRef = ref(null);

/**
 * Used to detect if the name was manually changed
 * @type {import("vue").Ref<boolean>}
 */
const handName = ref(false);

/**
 * Indicates if the event is a tournament
 * @type {import("vue").Ref<boolean>}
 */
const tournament = ref(true);

const id = ref("");
const name = ref("");
const beginning = ref("");
const description = ref("");
const city = ref("");
const address = ref("");
const price = ref(30);
const motion = ref("Všetky tézy tohoto turnaja sú improvizované");
const deadline = ref("");
const link = ref("");

const presetThumbnail = ref(null);
const presetOriginalThumbnail = ref(null);
const eventOrganizers = ref([]);

const potentialOrganizers = ref([]);

const userStore = useUserStore();
const loadingStore = useLoadingStore();
const eventsStore = useEventsStore();

const schedule = ref({
  days: [
    {
      beginning: 810,
      offset: 0,
      points: [
        {
          name: "otvorenie podujatia",
          duration: 30,
        },
      ],
    },
  ],
});

/**
 * This component handles creating new events, including UI for entering details,
 * uploading thumbnails, scheduling, and assigning organizers.
 */

/**
 * Computed property returning the last day of the event
 * @return {Date}
 */
const ending = computed(() => {
  // beginning with the schedule.days days added
  const date = new Date(beginning.value);

  // Get the sum of offsets of all days
  const sum = schedule.value.days.reduce((acc, day) => acc + day.offset, 0);
  const days = schedule.value.days.length + sum - 1;
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

/**
 * Suggests a name for the event based on its ID
 * @param {string} input
 * @return {string|null}
 */
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

const updateEvent = async (eventId) => {
  console.log("updating event");
  const event = await getEventById(eventId);

  // If the event does not exist, redirect to the 404 page
  if (!event) {
    router.push({ name: "NotFound" });
    return;
  }

  // Check if user is allowed to edit the event.
  // User must be developer or admin
  // or user must be one of the organizers
  if (!["developer", "admin"].includes(userStore.role)) {
    if (
      !["organizer", "junior"].includes(userStore.role) ||
      !event.organizers.includes(userStore.uid)
    ) {
      await router.push({ name: "Unauthorized" });
      return;
    }
  }

  console.log(event, "EVENT");

  // Batch update all reactive references
  nextTick(() => {
    id.value = event.id;
    name.value = event.name;
    beginning.value = event.beginningDate.toISOString().split("T")[0];
    description.value = event.description;
    city.value = event.city;
    address.value = event.address;
    price.value = event.price;
    motion.value = event.motion;
    deadline.value = event.deadline.toISOString().split("T")[0];
    schedule.value = event.schedule;
    presetThumbnail.value = event.thumbnail;
    presetOriginalThumbnail.value = event.originalThumbnail;
    eventOrganizers.value = event.organizers;
    tournament.value = event.id.startsWith("S"); // Assuming tournament IDs start with 'S'
    link.value = event.link;
  });
};

/**
 * Fetch potential organizers from the backend and store them locally.
 */
/**
 * Fetch potential organizers from the backend and update the local list
 * @async
 * @return {Promise<void>}
 */
const fetchPotentialOrganizers = async () => {
  console.log(userStore);

  try {
    const organizers = await getPotentialOrganizers();
    console.log(organizers);
    potentialOrganizers.value = [
      ...organizers
        .filter((organizer) => organizer.uid !== userStore.uid)
        .map((organizer) => ({
          ...organizer,
          selected: eventOrganizers.value.includes(organizer.uid),
        })),
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

// Remove the watchEffect and modify onMounted
watchEffect(async () => {
  if (edit && userStore.uid) {
    console.log("updating event from watchEffect");
    await updateEvent(editEventId);
    await fetchPotentialOrganizers();
  }
});

watchEffect(() => {
  if (userStore.uid != null) {
    if (!edit) {
      fetchPotentialOrganizers();
    }
  }
});

onMounted(async () => {
  console.log("mounted");
  if (userStore.uid != null) {
    if (!edit) {
      await fetchPotentialOrganizers();
    }
  }
});

/**
 * Checks if all conditions for submitting the new event are met
 * @return {boolean}
 */
const canSubmit = computed(() => {
  return (
    id.value &&
    name.value &&
    beginning.value &&
    city.value &&
    address.value &&
    price.value &&
    deadline.value &&
    (tournament.value ? motion.value : true) &&
    schedule.value.days.length > 0 &&
    potentialOrganizers.value.some((organizer) => organizer.selected) &&
    link.value
  );
});

const getEndTimeInMinutes = (day, pointIndex) => {
  let endTime = day.beginning;
  for (let i = 0; i <= pointIndex; i++) {
    endTime += day.points[i].duration;
  }
  return endTime;
};

/**
 * Parses the date string as UTC date
 * @param {string} val
 * @return {Date}
 */
const parseAsUTC = (val) => {
  // parse dateString as universal date
  return new Date(val + "T00:00:00Z");
};

/**
 * Submits the new event data to the server and navigates back to the home page on success.
 */
/**
 * Submits the new event data to the server
 * @async
 * @return {Promise<void>}
 */
const submit = async () => {
  loadingStore.loadingStart();

  // If no original thumbnail is set, upload the thumbnail and get the path
  let thumbnail = presetOriginalThumbnail.value;
  if (presetOriginalThumbnail.value === null) {
    thumbnail = await thumbnailRef.value.uploadThumbnail();
  }

  // Calculate beginningDate based on the first day's beginning time
  const firstDay = schedule.value.days[0];
  const beginningUTC = parseAsUTC(beginning.value);
  const beginningDate = new Date(
    beginningUTC.getTime() + firstDay.beginning * 60000,
  );
  // Convert to CET if necessary
  // const beginningDateCET = utcToZonedTime(beginningDate, 'CET');

  // Calculate endDate based on the last day's last point end time
  const endDate = ending.value;
  // Add minutes to the last day's last point end time
  const minutesOfLastDay = getEndTimeInMinutes(
    schedule.value.days[schedule.value.days.length - 1],
    schedule.value.days[schedule.value.days.length - 1].points.length - 1,
  );

  endDate.setMinutes(endDate.getMinutes() + minutesOfLastDay);
  // Convert to CET if necessary
  // const endDateCET = utcToZonedTime(endDate, 'CET');

  // organizers is only array of strings => uid of the selected organizers
  const organizers = potentialOrganizers.value
    .filter((organizer) => organizer.selected)
    .map((organizer) => organizer.uid);

  // { uid: uid, name: name, surname: surname, email: email, phone: phone }
  const contacts = potentialOrganizers.value
    .filter((organizer) => organizer.selected)
    .map((organizer) => ({
      uid: organizer.uid,
      name: organizer.name,
      surname: organizer.surname,
      email: organizer.email,
      phone: organizer.phone,
    }));

  // Create the event
  const event = {
    id: id.value.toLowerCase(),
    name: name.value,
    beginningDate: beginningDate, // Use beginningDateCET if converted
    endDate: endDate, // Use endDateCET if converted
    description: description.value,
    city: city.value,
    address: address.value,
    price: price.value,
    motion: motion.value,
    deadline: new Date(deadline.value),
    schedule: schedule.value,
    thumbnail: thumbnail,
    organizers: organizers,
    contacts: contacts,
    link: link.value,
  };

  console.log(event);

  await setEvent(event)
    .then(() => {
      console.log("Event created successfully");
      if (edit) {
        eventsStore.updateEvent(event);
      } else {
        eventsStore.addEvent(event);
      }
      router.push({ name: "Home" });
      loadingStore.loadingEnd();
    })
    .catch((error) => {
      console.error("Error creating event:", error);
      router.push({ name: "Home" });
      loadingStore.loadingEnd();
    });

  router.push({ name: "Home" });
};
</script>

<template>
  <div class="gap-4">
    <h1>
      {{
        !edit
          ? "Vytvoriť podujatie"
          : `Upraviť ${name !== "" ? name : "podujatie"}`
      }}
    </h1>
    <div
      class="flex flex-col w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-4 transition-all">
      <div class="grid grid-cols-2 gap-4 w-full shrink">
        <div
          class="flex font-bold h-16 px-5 rounded-[1.25rem] border-2 border-black duration-500 items-center justify-center vertical-center text-black text-center cursor-pointer transition-colors"
          :class="{ 'bg-black text-white': tournament }"
          @click="tournament = true">
          <p>Súťažné podujatie</p>
        </div>
        <div
          class="flex font-bold h-16 px-5 rounded-[1.25rem] border-2 border-black duration-500 items-center justify-center vertical-center text-black text-center cursor-pointer transition-colors"
          :class="{ 'bg-black text-white': !tournament }"
          @click="tournament = false">
          <p>Nesúťažné podujatie</p>
        </div>
      </div>
      <Field v-model="id" label="ID" placeholder="SZ271" :readonly="edit" />
      <Field
        v-model="name"
        label="Názov"
        @keyup="handName = true"
        placeholder="3. západoslovenský regionálny turnaj" />
      <div class="flex flex-col sm:grid sm:grid-cols-[auto_1fr] gap-4">
        <div
          class="self-center overflow-hidden rounded-[1.25rem] w-[26.875rem] max-w-full">
          <thumbnail
            ref="thumbnailRef"
            :name="name"
            :beginning-date="beginning"
            :end-date="ending"
            :city="city"
            :id="id"
            :thumbnail-path="presetThumbnail"
            :disabled="edit" />
        </div>
        <Field
          v-model="description"
          label="Popis"
          type="multiline"
          placeholder="Popis podujatia (voliteľné)" />
      </div>
      <Field v-model="beginning" label="Začiatok podujatia" type="date" />
      <Field v-model="city" label="Mesto" placeholder="Bratislava" />
      <Field
        v-model="address"
        label="Adresa podujatia"
        placeholder="Ventúrska 5, 811 01 Bratislava" />
      <Field
        v-model="price"
        label="Vstupné (€)"
        type="number"
        placeholder="30" />
      <Field
        v-model="motion"
        label="Pripravovaná téza"
        v-if="tournament"
        placeholder="Všetky tézy tohoto turnaja sú improvizované" />
      <Field v-model="deadline" label="Deadline na registráciu" type="date" />
      <Schedule v-model="schedule" :beginning="beginning" />
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
      <Field
        v-model="link"
        label="Link na registráciu"
        placeholder="https://forms.gle/DN" />
      <div class="grid grid-cols-1 sm:grid-cols-2">
        <button
          class="form-primary vertical-center sm:col-start-2"
          :disabled="!canSubmit"
          @click="submit">
          <span>{{ edit ? "Uložiť úpravy" : "Vytvoriť podujatie" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
