<script setup>
import Thumbnail from "../../components/Thumbnail.vue";
import { computed, onMounted, ref, watch, watchEffect, nextTick } from "vue";
import Field from "../../components/Field.vue";
import Schedule from "../../components/Schedule.vue";
import { useEventsStore, useLoadingStore, useUserStore } from "../../stores.js";
import {
  getFirebaseEvent,
  getPotentialOrganizers,
  setEvent,
  getEventFile,
} from "../../firebase/events.js";
import Toggle from "../../components/Toggle.vue";
import router from "../../router.js";
import { useRoute } from "vue-router";
import ImagePreview from "../../components/ImagePreview.vue";
import {
  suggestName,
  createDefaultEvent,
  canSubmitEvent,
  calculateEndingDate,
  prepareEventData,
} from "../../helpers/event.js";
import SponsorsView from "../../components/SponsorsView.vue";

const props = defineProps({
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// if edit, get the :id from the route
const editEventId = props.edit ? useRoute().params.id : null;

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
 * Single reactive event object containing all event properties
 */
const event = ref(createDefaultEvent());

/**
 * List of potential organizers for the event
 */
const potentialOrganizers = ref([]);

const userStore = useUserStore();
const loadingStore = useLoadingStore();
const eventsStore = useEventsStore();

/**
 * Computed property returning the last day of the event
 */
const ending = computed(() =>
  calculateEndingDate(event.value.beginning, event.value.schedule),
);

/**
 * Checks if all conditions for submitting the new event are met
 */
const canSubmit = computed(() =>
  canSubmitEvent(event.value, potentialOrganizers.value),
);

/**
 * Fetch sponsors data with file URLs
 */
const getSponsors = async (localSponsors) => {
  return await Promise.all(
    localSponsors.map(async (sponsor) => {
      return {
        original: sponsor,
        url: await getEventFile(sponsor),
      };
    }),
  );
};

/**
 * Watch for ID changes to suggest event name
 */
watch(
  () => event.value.id,
  (newId) => {
    if (!handName.value) {
      const suggestion = suggestName(newId);
      if (suggestion) {
        event.value.name = suggestion.name;
        event.value.tournament = suggestion.tournament;
      }
    }
  },
);

/**
 * Updates the event with data from Firebase
 */
const updateEvent = async (eventId) => {
  console.log("updating event");
  const firebaseEvent = await getFirebaseEvent(eventId);

  // If the event does not exist, redirect to the 404 page
  if (!firebaseEvent) {
    await router.push({ name: "NotFound" });
    return;
  }

  // Check if user is allowed to edit the event.
  // User must be developer or admin
  // or user must be one of the organizers
  if (!["developer", "admin"].includes(userStore.role)) {
    if (
      !["organizer", "junior"].includes(userStore.role) ||
      !firebaseEvent.organizers.includes(userStore.uid)
    ) {
      await router.push({ name: "Unauthorized" });
      return;
    }
  }

  // Batch update the event object
  await nextTick(async () => {
    event.value = {
      id: firebaseEvent.id,
      name: firebaseEvent.name,
      beginning: firebaseEvent.beginningDate.toISOString().split("T")[0],
      description: firebaseEvent.description,
      city: firebaseEvent.city,
      address: firebaseEvent.address,
      price: firebaseEvent.price,
      motion: firebaseEvent.motion,
      deadline: firebaseEvent.deadline.toISOString().split("T")[0],
      schedule: firebaseEvent.schedule,
      presetThumbnail: firebaseEvent.thumbnail,
      presetOriginalThumbnail: firebaseEvent.originalThumbnail,
      organizers: firebaseEvent.organizers,
      tournament: firebaseEvent.motion !== null,
      link: firebaseEvent.link,
      draft: firebaseEvent.draft || false,
      sponsors: firebaseEvent.sponsors || [],
    };

    // Set handName to true since we're loading an existing event
    handName.value = true;
  });
};

/**
 * Fetch potential organizers from the backend and update the local list
 */
const fetchPotentialOrganizers = async () => {
  try {
    const organizers = await getPotentialOrganizers();

    potentialOrganizers.value = [
      ...organizers
        .filter((organizer) => organizer.uid !== userStore.uid)
        .map((organizer) => ({
          ...organizer,
          selected: event.value.organizers.includes(organizer.uid),
        })),
      {
        ...userStore.userData,
        self: true,
        selected: event.value.organizers.includes(userStore.uid),
      },
    ];

    // Remove all potential organizers that have duplicate UIDs
    const uniqueOrganizers = [];
    const uniqueUIDs = [];
    for (const organizer of potentialOrganizers.value) {
      if (!uniqueUIDs.includes(organizer.uid)) {
        uniqueOrganizers.push(organizer);
        uniqueUIDs.push(organizer.uid);
      }
    }

    potentialOrganizers.value = uniqueOrganizers;

    // Sort the potential organizers by surname alphabetically
    potentialOrganizers.value.sort((a, b) =>
      a.surname.localeCompare(b.surname),
    );
  } catch (error) {
    console.error("Error fetching potential organizers:", error);
  }
};

// Watch for user authentication and edit state
watchEffect(async () => {
  if (props.edit && userStore.uid) {
    await updateEvent(editEventId);
    await fetchPotentialOrganizers();
  } else if (userStore.uid) {
    await fetchPotentialOrganizers();
  }
});

/**
 * Submits the event data to the server
 */
const submit = async (draft) => {
  loadingStore.loadingStart();

  try {
    // Update draft status
    event.value.draft = draft;

    // Prepare the event data for submission
    const eventData = await prepareEventData(
      event.value,
      thumbnailRef,
      potentialOrganizers.value,
    );

    await setEvent(eventData);

    if (props.edit) {
      eventsStore.updateEvent(eventData);
    } else {
      eventsStore.addEvent(eventData);
    }

    router.push({ name: "Home" });
  } catch (error) {
    console.error("Error creating/updating event:", error);
    router.push({ name: "Home" });
  } finally {
    loadingStore.loadingEnd();
  }
};
</script>

<template>
  <div class="gap-4">
    <h1 class="leading-[1.1]" style="text-wrap: pretty">
      {{
        !edit
          ? "Vytvoriť podujatie"
          : `Upraviť ${event.name !== "" ? event.name : "podujatie"} ${event.draft ? "(Koncept)" : ""}`
      }}
    </h1>
    <div
      class="flex flex-col w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-4 transition-all">
      <div class="grid grid-cols-2 gap-4 w-full shrink">
        <div
          class="flex font-bold h-16 px-5 rounded-[1.25rem] border-2 border-black duration-500 items-center justify-center vertical-center text-black text-center cursor-pointer transition-colors"
          :class="{ 'bg-black text-white': event.tournament }"
          @click="event.tournament = true">
          <p>Súťažné podujatie</p>
        </div>
        <div
          class="flex font-bold h-16 px-5 rounded-[1.25rem] border-2 border-black duration-500 items-center justify-center vertical-center text-black text-center cursor-pointer transition-colors"
          :class="{ 'bg-black text-white': !event.tournament }"
          @click="event.tournament = false">
          <p>Nesúťažné podujatie</p>
        </div>
      </div>
      <Field
        v-model="event.id"
        label="ID"
        placeholder="SZ271"
        :readonly="edit" />
      <Field
        v-model="event.name"
        label="Názov"
        placeholder="3. západoslovenský regionálny turnaj"
        @keyup="handName = true" />
      <div class="flex flex-col sm:grid sm:grid-cols-[auto_1fr] gap-4">
        <div
          class="self-center overflow-hidden rounded-[1.25rem] w-[26.875rem] max-w-full">
          <thumbnail
            :id="event.id"
            ref="thumbnailRef"
            :name="event.name"
            :beginning-date="event.beginning"
            :end-date="ending"
            :city="event.city"
            :thumbnail-path="event.presetThumbnail"
            :disabled="edit" />
        </div>
        <Field
          v-model="event.description"
          label="Popis"
          type="multiline"
          placeholder="Popis podujatia (voliteľné)" />
      </div>
      <Field v-model="event.beginning" label="Začiatok podujatia" type="date" />
      <Field v-model="event.city" label="Mesto" placeholder="Bratislava" />
      <Field
        v-model="event.address"
        label="Adresa podujatia"
        placeholder="Ventúrska 5, 811 01 Bratislava" />
      <Field
        v-model="event.price"
        label="Vstupné (€)"
        type="number"
        placeholder="30" />
      <Field
        v-if="event.tournament"
        v-model="event.motion"
        label="Pripravovaná téza"
        placeholder="Všetky tézy tohoto turnaja sú improvizované" />
      <Field
        v-model="event.deadline"
        label="Deadline na registráciu"
        type="date" />
      <Schedule v-model="event.schedule" :beginning="event.beginning" />
      <div
        class="flex flex-col w-full h-max-60 border-black border-2 rounded-[1.25rem] px-5 py-3 text-black gap-4">
        <h6 class="font-bold mb-0">Organizátori/-ky podujatia</h6>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
          <div v-for="organizer in potentialOrganizers" :key="organizer.uid">
            <toggle
              v-model="organizer.selected"
              :label="organizer.name + ' ' + organizer.surname"
              :secondary="organizer.email"
              :sublabel="organizer.email" />
          </div>
        </div>
      </div>
      <SponsorsView v-model="event.sponsors" />
      <Field
        v-model="event.link"
        label="Link na registráciu"
        placeholder="https://forms.gle/DN" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <button
          class="form-secondary vertical-center"
          :disabled="!canSubmit"
          @click="submit(true)">
          <span>
            {{ event.draft ? "Uložiť koncept" : "Zmeniť na koncept" }}
          </span>
        </button>
        <button
          class="form-primary vertical-center sm:col-start-2"
          :disabled="!canSubmit"
          @click="submit(false)">
          <span>
            {{ edit ? "Zverejniť úpravy" : "Zverejniť podujatie" }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
