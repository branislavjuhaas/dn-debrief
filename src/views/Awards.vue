<script setup>
import { ref, onMounted, watch } from "vue";
import { getAllAwards } from "../firebase/awards.js";
import { useUserStore } from "../stores.js";

// State variables
const awards = ref([]);
const userStore = useUserStore();

/**
 * Fetch all awards and filter them based on user role and ownership.
 * If the user is a developer, display all awards.
 * Otherwise, display awards with category 'program' or 'organization' or those owned by the user.
 */
const fetchAwards = async () => {
  awards.value = await getAllAwards();

  if (userStore.role !== "developer") {
    awards.value = awards.value.filter(
      (award) =>
        award.category === "program" ||
        award.category === "organization" ||
        userStore.awards.some((userAward) => userAward.id === award.id),
    );
  }

  // Update the symbol's background color based on award ownership
  awards.value.forEach((award) => {
    if (
      userStore.awards.legend.some((userAward) => userAward.id === award.id)
    ) {
      award.symbol = `
        <defs>
          <linearGradient id='legend-gradient' x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' style='stop-color:#ffd900;stop-opacity:1' />
            <stop offset='100%' style='stop-color:#c3a601;stop-opacity:1' />
          </linearGradient>
        </defs>
        <mask id='legend-mask'>${award.symbol}</mask>
        <rect width='20' height='20' fill='url(#legend-gradient)' mask='url(#legend-mask)' />
      `;
      award.symbol = award.symbol.replaceAll("black", "white");
    }
  });
};

// Fetch awards on component mount or when user role is set
onMounted(() => {
  if (userStore.uid) {
    fetchAwards();
  } else {
    const unwatch = watch(
      () => userStore.role,
      (newRole) => {
        if (newRole) {
          fetchAwards();
          unwatch();
        }
      },
    );
  }
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Ocenenia</h1>
    <div
      class="flex flex-row flex-wrap justify-start shrink-0 items-center w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <router-link
        v-for="award in awards"
        :key="award.id"
        :to="'/awards/' + award.id"
        class="flex flex-col flex-grow flex-basis-1/3 w-1/5 h-32 rounded-[1.25rem] justify-center items-center gap-2 m-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-20 w-20"
          viewBox="0 0 20 20"
          v-html="award.symbol" />
        <p
          class="font-bold text-center text-pretty"
          :class="{
            'selected-award': !(
              userStore.awards.ordinary.some(
                (userAward) => userAward.id === award.id,
              ) ||
              userStore.awards.legend.some(
                (userAward) => userAward.id === award.id,
              )
            ),
          }">
          {{
            userStore.awards.legend.some(
              (userAward) => userAward.id === award.id,
            )
              ? award.legendary.title
              : award.regular.title
          }}
        </p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.selected-award {
  @apply font-normal;
}
</style>
