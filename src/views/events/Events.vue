<script setup>
import { computed, onMounted, ref, watch, reactive } from "vue";
import { useUserStore } from "../../stores.js";
import { getEventsAfterNow } from "../../firebase/events.js";

import trophy from "../../assets/icons/trophy.svg";
import book from "../../assets/icons/book.svg";

const props = defineProps({
  onlyMyEvents: Boolean,
});

// Changed: make maximumDateRange reactive to update filteredEvents when modified.
const maximumDateRange = reactive({
  from: new Date(props.from) || new Date(),
  to: new Date(props.to) || new Date(),
});

const events = ref([]);

const filteredEvents = computed(() => {
  return events.value.filter((event) => {
    if (props.onlyMyEvents && !event.organizers.includes(useUserStore().uid)) {
      console.log(event.id, "FAILED ONLY MY EVENTS");
      return false;
    }

    if (
      maximumDateRange.from &&
      event.endDate.toDate() < maximumDateRange.from
    ) {
      return false;
    }

    return !(
      maximumDateRange.to && event.endDate.toDate() > maximumDateRange.to
    );
  });
});

onMounted(async () => {
  events.value = await getEventsAfterNow();
});

const datesAggregate = (beginningDate, endDate) => {
  beginningDate = beginningDate.toDate();
  endDate = endDate.toDate();

  const formatDate = (date) =>
    `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  const formatShortDate = (date) => `${date.getDate()}.${date.getMonth() + 1}`;

  return beginningDate.getDate() === endDate.getDate()
    ? formatDate(beginningDate)
    : beginningDate.getFullYear() === endDate.getFullYear()
      ? `${formatShortDate(beginningDate)} - ${formatDate(endDate)}`
      : `${formatDate(beginningDate)} - ${formatDate(endDate)}`;
};
</script>

<template>
  <div class="flex flex-col w-full gap-2 text-black">
    <router-link
      v-for="event in filteredEvents"
      :key="event.id"
      class="relative w-full border-black border-2 rounded-[1.25rem] overflow-hidden"
      :to="{ name: 'EditEvent', params: { id: event.id } }">
      <div
        class="absolute w-[calc(100%+2rem)] h-[calc(100%+2rem)] top-[-1rem] left-[-1rem] opacity-15">
        <img
          :src="event.thumbnail"
          alt="Náhľad"
          class="absolute w-full h-full object-cover blur-[0.2rem]" />
      </div>
      <div
        class="grid sm:grid-cols-[1fr_auto] grid-rows-2 grid-flow-row gap-2 sm:gap-4 w-full h-full px-5 pt-3 pb-2">
        <div class="flex flex-row gap-2">
          <img
            :src="event.motion ? trophy : book"
            alt="Typ podujatia"
            class="w-5 -mt-1" />
          <p class="font-bold">{{ event.name }}</p>
        </div>
        <p class="sm:text-right">
          {{ (event.draft ? "KONCEPT / " : "") + event.id.toUpperCase() }}
        </p>
        <p class="font-bold">
          {{ datesAggregate(event.beginningDate, event.endDate) }} -
          {{ event.city }}
        </p>
        <!-- For each contact {name + " " + surname}. contacts joined by " | " -->
        <p class="sm:text-right">
          {{
            event.contacts
              .map((contact) => contact.name + " " + contact.surname)
              .join(" | ")
          }}
        </p>
      </div>
    </router-link>
  </div>
</template>

<style scoped></style>
