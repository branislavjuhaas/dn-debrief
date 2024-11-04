<script setup>
import { ref, onMounted } from "vue";
import { getAllAwards } from "../firebase/awards.js";
import { useUserStore } from "../stores.js";

// State variables
const awards = ref([]);
const selectedAward = ref(null);
const userStore = useUserStore();

// Function to fetch all awards
const fetchAwards = async () => {
  awards.value = await getAllAwards();
  selectRandomAward();
};

// Function to select a random award based on the date
const selectRandomAward = () => {
  const today = new Date().getDate();
  selectedAward.value = awards.value[today % awards.value.length];
};

// Function to handle award selection
const handleAwardSelection = (award) => {
  selectedAward.value = award;
};

// Function to handle scroll event and change selected award
const handleScroll = (event) => {
  const scrollAmount = event.deltaY;
  if (scrollAmount > 0) {
    const currentIndex = awards.value.indexOf(selectedAward.value);
    const nextIndex = (currentIndex + 1) % awards.value.length;
    selectedAward.value = awards.value[nextIndex];
  } else {
    const currentIndex = awards.value.indexOf(selectedAward.value);
    const prevIndex = (currentIndex - 1 + awards.value.length) % awards.value.length;
    selectedAward.value = awards.value[prevIndex];
  }
};

onMounted(() => {
  fetchAwards();
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Ocenenia</h1>
    <div class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div class="flex flex-col gap-4">
        <div class="grid grid-rows-1 font-bold gap-4 items-center grid-cols-3">
          <p>Award Name</p>
          <p>Description</p>
          <p>Visual List</p>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-3 items-center cursor-pointer gap-4 rounded-[1.25rem] duration-150 transition-all delay-300 hover:py-5 hover:text-red">
          <p class="truncate">{{ selectedAward?.name }}</p>
          <p class="overflow-hidden sm:truncate">{{ selectedAward?.description }}</p>
          <div class="flex flex-row">
            <div v-for="award in awards" :key="award.id" @click="handleAwardSelection(award)" class="flex flex-row relative items-center justify-center w-20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor" v-html="award.symbol"></svg>
              <div v-if="award !== selectedAward" class="absolute right-0 w-[2px] h-8 bg-black rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selected-award {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: blue;
}
</style>
