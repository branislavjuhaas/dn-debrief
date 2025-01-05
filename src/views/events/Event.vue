<script setup>
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { getEventById } from "../../firebase/events";
import { useUserStore } from "../../stores.js";
import { formatSlovakDate } from "../../utilities.js";
import Toggle from "../../components/Toggle.vue";

const id = useRoute().params.id;
const userStore = useUserStore();

const event = ref(null);

const message = ref("");

watchEffect(() => {
  if (!userStore.uid) {
    return "Pre registráciu na podujatie sa musíte prihlásiť.";
  }

  if (!userStore.isMember) {
    return "Pre registráciu na podujatie musíte byť členom/-kou SDA.";
  }

  if (event.value?.deadline < new Date()) {
    return "Registrácia na podujatie je uzavretá.";
  }

  return "";
});

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

const getFormattedDate = (beginningDate, index) => {
  const date = new Date(beginningDate);
  date.setDate(date.getDate() + index);
  const dayOfWeek = weekDays[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${dayOfWeek} (${day}.${month}.)`;
};

const getCumulativeIndex = (index) => {
  const sum = event.value.schedule.days
    .slice(0, index)
    .reduce((acc, day) => acc + (day.offset || 0), 0);

  return sum + index;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins < 10 ? "0" : ""}${mins}`;
};

const getCumulativeMinutes = (day, index) => {
  const sum = day.points
    .slice(0, index)
    .reduce((acc, point) => acc + point.duration, 0);
  return sum + day.beginning;
};

const fetchEvent = async () => {
  if (userStore.uid) {
    event.value = await getEventById(id);
    console.log(event.value);
  }
};

const register = () => {
  window.open(event.value.link, "_blank");
};

onMounted(async () => {
  await fetchEvent();
});

watch(id, async () => {
  await fetchEvent();
});

watch(
  () => userStore.uid,
  async () => {
    await fetchEvent();
  },
);
</script>

<template>
  <div class="gap-4">
    <h1>{{ event?.name ?? "Detail podujatia" }}</h1>
    <div
      class="grid grid-flow-row grid-cols-1 sm:grid-cols-3 xl:grid-cols-[auto_auto_auto_1fr] gap-4 min-h-12 w-full text-black font-bold">
      <div
        class="flex flex-row gap-2 h-12 w-full items-center bg-white px-5 rounded-[1.25rem] shrink-0">
        <img
          src="./../../assets/icons/calendar.svg"
          alt="calendar"
          class="w-5" />
        <p class="mt-1">{{ eventDates ? eventDates : "~~.~~.~~~~" }}</p>
      </div>
      <div
        class="flex flex-row gap-2 h-12 w-full items-center bg-white px-5 rounded-[1.25rem] shrink-0">
        <img
          src="./../../assets/icons/deadline.svg"
          alt="calendar"
          class="w-5" />
        <p class="mt-1">
          {{ event ? formatSlovakDate(event.deadline) : "~~.~~.~~~~" }}
        </p>
      </div>
      <div
        class="flex flex-row gap-2 h-12 w-full items-center bg-white px-5 rounded-[1.25rem] shrink-0">
        <img src="./../../assets/icons/bills.svg" alt="calendar" class="w-5" />
        <p class="mt-1">{{ event ? `${event.price}&euro;` : "~~&euro;" }}</p>
      </div>
      <div
        class="flex flex-row gap-2 min-h-12 py-2 xl:h-12 overflow-x-hidden w-full col-span-full xl:col-span-1 items-center bg-white px-5 rounded-[1.25rem] shrink-0">
        <img
          src="./../../assets/icons/location.svg"
          alt="calendar"
          class="w-5" />
        <p class="mt-1 max-w-full xl:truncate text-nowrap">
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
      <div class="flex flex-col gap-8">
        <p
          v-if="event?.description"
          class="text-justify border-b-2 pb-8 border-black border-dashed">
          {{ event.description }}
        </p>
        <div class="flex flex-col border-b-2 pb-8 border-black border-dashed">
          <div id="schedule" class="flex flex-row flex-wrap max-w-full gap-12">
            <div
              v-for="(day, index) in event?.schedule.days"
              :key="day.id"
              class="grid grid-cols-[auto_auto_auto_auto] grid-flow-row h-min">
              <h2 class="text-black font-bold mb-4 col-span-full">
                {{
                  getFormattedDate(
                    event?.beginningDate,
                    getCumulativeIndex(index) + day.offset,
                  )
                }}
              </h2>
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
          <p class="font-bold">
            V prípade otázok a pripomienok sa neváhajte obrátiť na
            organizátorov/-ky podujatia
          </p>
          <div
            :class="`grid w-full gap-4 grid-cols-1 sm:grid-cols-${Math.min(event.contacts.length, 2)} md:grid-cols-${Math.min(event.contacts.length, 3)} lg:grid-cols-${Math.min(event.contacts.length, 4)}`">
            <a
              v-for="organizer in event.contacts"
              :href="'mailto:' + organizer.email"
              :key="organizer.id"
              class="grid grid-rows-2 grid-cols-[1.75rem_auto] border-2 border-black rounded-[1.25rem] px-5 py-3 hover:border-red">
              <img src="./../../assets/icons/educator.svg" alt="" class="w-5" />
              <p class="font-bold">
                {{ organizer.name }} {{ organizer.surname }}
              </p>
              <p class="col-span-2">{{ organizer.phone }}</p>
            </a>
          </div>
        </div>
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center sm:grid-rows-1 sm:grid-cols-[1fr_auto_auto]">
        <p
          v-if="message !== ''"
          class="form-message row-start-3 sm:row-start-1">
          {{ message }}
        </p>
        <router-link
          to="/events/rules"
          class="form-secondary vertical-center col-start-1 sm:col-start-2">
          <span>Pravidlá registrácie</span>
        </router-link>
        <button
          @click="register"
          class="form-primary vertical-center col-start-1 sm:col-start-3"
          :disabled="message !== ''">
          <span>Registrovať sa</span>
        </button>
      </div>
    </div>
    <router-link
      v-if="
        userStore.role !== null &&
        ['developer', 'admin', 'organizer', 'junior'].includes(userStore.role)
      "
      :to="{ name: 'EditEvent', params: { id: id } }"
      class="alternative vertical-center w-full">
      <p>Upraviť podujatie</p>
    </router-link>
  </div>
</template>

<style scoped>
a:hover img {
  filter: brightness(0) saturate(100%) invert(32%) sepia(92%) saturate(6387%)
    hue-rotate(342deg) brightness(92%) contrast(96%);
}

.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}
</style>
