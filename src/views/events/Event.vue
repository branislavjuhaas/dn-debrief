<!--
    ///    |    DN Cascade
   / ///   |    (C) 2024 - 2025, Branislav Juhás
  / / /    |    Part of DN Family Family
 /
-->

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getEventById, getEventFile } from "../../firebase/events";
import { useUserStore } from "../../stores.js";
import { formatSlovakDate } from "../../utilities.js";
import router from "../../router.js";
import ContactCard from "../../components/ContactCard.vue";
import up from "../../assets/icons/up.svg";
import down from "../../assets/icons/down.svg";

const userStore = useUserStore();

const route = useRoute();
const event = ref(null);

const showRules = ref(false);

/**
 * Sanitized event description in HTML with clickable links.
 * @type {import('vue').ComputedRef<string>}
 */
const sanitizedDescription = computed(() =>
  event.value && event.value.description
    ? event.value.description
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    : "",
);

/**
 * Registration status message object.
 * @returns {Object|string}
 */
const message = computed(() => {
  if (!userStore.uid) {
    return { text: "Pre registráciu na podujatie sa musíte prihlásiť." };
  }

  if (!userStore.isMember) {
    return {
      text: "Pre registráciu na podujatie sa musíte {LINK}.",
      link: "/join",
      linkText: "stať členom SDA",
    };
  }

  if (event.value?.deadline < new Date()) {
    return { text: "Registrácia na podujatie je uzavretá." };
  }

  return "";
});

/**
 * Formatted date range for the event.
 * @type {import('vue').ComputedRef<string>}
 */
const eventDates = computed(() => {
  if (event.value) {
    const { beginningDate, endDate } = event.value;

    const formatDate = (date) =>
      `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    const formatShortDate = (date) =>
      `${date.getDate()}.${date.getMonth() + 1}`;

    return beginningDate.getDate() === endDate.getDate()
      ? formatDate(beginningDate)
      : beginningDate.getFullYear() === endDate.getFullYear()
        ? `${formatShortDate(beginningDate)} - ${formatDate(endDate)}`
        : `${formatDate(beginningDate)} - ${formatDate(endDate)}`;
  }
  return "";
});

const weekDays = [
  "Nedeľa",
  "Pondelok",
  "Utorok",
  "Streda",
  "Štvrtok",
  "Piatok",
  "Sobota",
];

/**
 * Returns formatted date string for a given day offset.
 * @param {Date} beginningDate - Starting date of the event.
 * @param {number} index - Offset index in days.
 * @returns {string}
 */
const getFormattedDate = (beginningDate, index) => {
  const date = new Date(beginningDate);
  date.setDate(date.getDate() + index);
  const dayOfWeek = weekDays[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayOfWeek} (${day}.${month}.)`;
};

/**
 * Calculates cumulative index for multi-day schedule.
 * @param {number} index - Day index in schedule.
 * @returns {number}
 */
const getCumulativeIndex = (index) => {
  const sum = event.value.schedule.days
    .slice(0, index)
    .reduce((acc, day) => acc + (day.offset || 0), 0);

  return sum + index;
};

/**
 * Converts minutes to HH:mm format.
 * @param {number} minutes
 * @returns {string}
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins < 10 ? "0" : ""}${mins}`;
};

/**
 * Calculates cumulative minutes from start of day for schedule point.
 * @param {Object} day - Schedule day object.
 * @param {number} index - Point index in day.
 * @returns {number}
 */
const getCumulativeMinutes = (day, index) => {
  const sum = day.points
    .slice(0, index)
    .reduce((acc, point) => acc + point.duration, 0);
  return sum + day.beginning;
};

/**
 * Fetches event by ID and redirects to NotFound if missing.
 * @param {string} id
 * @returns {Promise<void>}
 */
const fetchEvent = async (id) => {
  event.value = await getEventById(id);

  if (!event.value) {
    await router.push({ name: "NotFound" });
  }

  event.value.sponsors = await Promise.all(
    event.value.sponsors.map(async (sponsor) => {
      return {
        original: sponsor,
        url: await getEventFile(sponsor),
      };
    }),
  );

  console.log(event.value.sponsors);
};

/**
 * Opens event registration link in a new tab.
 */
const register = () => {
  window.open(event.value.link, "_blank");
};

onMounted(async () => {
  await fetchEvent(route.params.id);
});

watch(
  () => route.params.id,
  async (newId) => {
    await fetchEvent(newId);
  },
  { immediate: true },
);
</script>

<template>
  <div class="gap-4">
    <h1>{{ event?.name ?? "Detail podujatia" }}</h1>
    <div
      class="grid grid-flow-row grid-cols-1 sm:grid-cols-3 xl:grid-cols-[auto_auto_auto_1fr] gap-4 min-h-12 w-full text-black font-bold">
      <div class="info-card">
        <img src="./../../assets/icons/calendar.svg" alt="calendar" />
        <p>{{ eventDates ? eventDates : "~~.~~.~~~~" }}</p>
      </div>
      <div class="info-card">
        <img src="./../../assets/icons/deadline.svg" alt="calendar" />
        <p>
          {{ event ? formatSlovakDate(event.deadline) : "~~.~~.~~~~" }}
        </p>
      </div>
      <div class="info-card">
        <img src="./../../assets/icons/bills.svg" alt="calendar" />
        <p>{{ event ? `${event.price}&euro;` : "~~&euro;" }}</p>
      </div>
      <div class="info-card">
        <img src="./../../assets/icons/location.svg" alt="calendar" />
        <p class="max-w-full xl:truncate text-nowrap">
          {{ event ? event.address : "" }}
        </p>
      </div>
    </div>
    <div
      v-if="event?.motion"
      class="flex flex-row gap-2 min-h-12 py-2 w-full items-center bg-white text-black font-bold px-5 rounded-[1.25rem]">
      <img src="./../../assets/icons/cube.svg" alt="calendar" class="w-5" />
      <p class="mt-1">{{ event.motion }}</p>
    </div>
    <div
      class="flex flex-col justify-between w-full bg-white text-black min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="flex flex-col gap-12">
        <div v-if="event?.description">
          <h6 class="font-bold">Popis podujatia</h6>
          <p
            id="event-description"
            class="text-justify whitespace-pre-line"
            v-html="sanitizedDescription"></p>
        </div>
        <div class="flex flex-col">
          <div id="schedule" class="flex flex-row flex-wrap max-w-full gap-12">
            <div
              v-for="(day, index) in event?.schedule.days"
              :key="day.id"
              class="grid grid-cols-[auto_auto_auto_auto] grid-flow-row h-min">
              <p class="text-black font-bold mb-4 col-span-full">
                {{
                  getFormattedDate(
                    event?.beginningDate,
                    getCumulativeIndex(index) + day.offset,
                  )
                }}
              </p>
              <template
                v-for="(point, pointIndex) in day.points"
                :key="point.id">
                <p class="font-bold mr-1">
                  {{ minutesToTime(getCumulativeMinutes(day, pointIndex)) }}
                </p>
                <p class="font-bold mr-1">
                  {{ point.duration > 0 ? "-" : "" }}
                </p>
                <p class="font-bold mr-2">
                  {{
                    point.duration > 0
                      ? minutesToTime(
                          getCumulativeMinutes(day, pointIndex) +
                            point.duration,
                        )
                      : ""
                  }}
                </p>
                <p>{{ point.name }}</p>
              </template>
            </div>
          </div>
        </div>
        <div v-if="event?.contacts" id="organizers" class="flex flex-col gap-2">
          <h6 class="font-bold">Organizátori/-ky podujatia</h6>
          <div
            :class="`grid w-full gap-4 grid-cols-1 sm:grid-cols-${Math.min(event.contacts.length, 2)} md:grid-cols-${Math.min(event.contacts.length, 3)} lg:grid-cols-${Math.min(event.contacts.length, 4)}`">
            <ContactCard
              v-for="organizer in event.contacts"
              :href="'mailto:' + organizer.email"
              :contact="organizer" />
          </div>
        </div>
        <div v-if="event?.sponsors" id="sponsors" class="flex flex-col gap-2">
          <h6 class="font-bold">Podujatie podporili</h6>
          <div
            class="flex flex-row gap-8 flex-wrap overflow-hidden items-center justify-center">
            <img
              v-for="sponsor in event.sponsors"
              :key="sponsor.original"
              :src="sponsor.url"
              :alt="sponsor.original"
              class="max-h-32 max-w-full object-contain" />
          </div>
        </div>
        <div v-if="showRules" class="flex flex-col">
          <h6 class="font-bold">
            Pravidlá registrácie a účasti na podujatiach
          </h6>
          <ol class="list-decimal list-inside text-justify space-y-2">
            <li>
              Bez registrácie, ktorá pre osoby do 18 rokov obsahuje aj súhlasy
              rodičov, z právneho hľadiska nemôžeme umožniť účasť na našom
              podujatí.
            </li>
            <li>
              Poplatok treba uhradiť najneskôr v deň zahájenia podujatia. Tím,
              ktorý neuhradil účastnícke poplatky za jeden turnaj, sa nebude
              môcť zúčastniť ďalšieho turnaja SDL, kým dlh nevyrovná. Nárok na
              vrátenie účastníckeho poplatku má tím iba v prípade, že sa odhlási
              viac ako 5 dní pred konaním turnaja.
            </li>
            <li>
              Výnimku majú kluby, ktorým hradí časť účastníckych poplatkov škola
              &ndash; nemusia uhradiť poplatky pred konaním turnaja, ale musia
              zaslať informácie k vystaveniu faktúry pred jeho konaním.
            </li>
          </ol>
        </div>
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center sm:grid-rows-1 sm:grid-cols-[1fr_auto_auto]">
        <p
          v-if="message !== ''"
          class="form-message row-start-3 sm:row-start-1">
          <router-link
            v-if="message.link"
            :to="message.link"
            class="text-red underline">
            {{ message.linkText }}
          </router-link>
        </p>
        <button
          class="form-secondary vertical-center col-start-1 gap-2 sm:col-start-2"
          @click="showRules = !showRules">
          <img :src="showRules ? up : down" alt="rules" class="w-5 h-5 !mt-0" />
          <span>Pravidlá registrácie</span>
        </button>
        <button
          class="form-primary vertical-center col-start-1 sm:col-start-3"
          :disabled="message !== ''"
          @click="register">
          <span>Registrovať sa</span>
        </button>
      </div>
    </div>
    <router-link
      v-if="
        userStore.role !== null &&
        (['developer', 'admin'].includes(userStore.role) ||
          (['organizer', 'junior'].includes(userStore.role) &&
            event?.organizers?.includes(userStore.uid)))
      "
      :to="{ name: 'EditEvent', params: { id: route.params.id } }"
      class="alternative vertical-center w-full">
      <p>Upraviť podujatie</p>
    </router-link>
  </div>
</template>

<style scoped>
.info-card {
  @apply flex flex-row gap-2 min-h-12 py-2 xl:h-12 overflow-x-hidden w-full col-span-full xl:col-span-1 items-center bg-white px-5 rounded-[1.25rem] shrink-0;
}

.info-card p {
  @apply mt-1;
}

.info-card img {
  @apply w-5 h-5;
}

.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}

/*all a elements injected into #event-description shall have underline using deep*/
:deep(#event-description a) {
  text-decoration: underline;
}
</style>
