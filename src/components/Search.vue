<script setup>
// Import necessary modules and functions
import { useUserStore } from "../stores.js";
import { algoliasearch } from "algoliasearch";
import { computed, ref } from "vue";

// Define reactive variables
const searchResults = ref([]);
const active = ref(false);
const query = ref("");

// Get user data from store
const user = useUserStore();

const client = algoliasearch("O3UGZ9QDEJ", "02455aca81a71f0a4e00b53fb3812175");

// Array of SVG paths for icons
const icons = [
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.2692 5.73333C12.2692 6.95327 11.2668 7.96667 10 7.96667C8.73318 7.96667 7.73077 6.95327 7.73077 5.73333C7.73077 4.5134 8.73318 3.5 10 3.5C11.2668 3.5 12.2692 4.5134 12.2692 5.73333ZM13.7692 5.73333C13.7692 7.7952 12.0817 9.46667 10 9.46667C7.91832 9.46667 6.23077 7.7952 6.23077 5.73333C6.23077 3.67147 7.91832 2 10 2C12.0817 2 13.7692 3.67147 13.7692 5.73333ZM8.46342 12.0333H11.5366C13.6689 12.0333 15.5 13.851 15.5 16.2222C15.5 16.3188 15.4636 16.3929 15.4181 16.4403C15.3735 16.4867 15.33 16.5 15.2927 16.5H4.70732C4.67003 16.5 4.62647 16.4867 4.58194 16.4403C4.5364 16.3929 4.5 16.3188 4.5 16.2222C4.5 13.851 6.33108 12.0333 8.46342 12.0333ZM3 16.2222C3 13.0803 5.44606 10.5333 8.46342 10.5333H11.5366C14.5539 10.5333 17 13.0803 17 16.2222C17 17.2041 16.2356 18 15.2927 18H4.70732C3.76439 18 3 17.2041 3 16.2222Z" fill="black" />',
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M9.67244 1.96771C9.87332 1.8441 10.1267 1.8441 10.3276 1.96771L18.4526 6.96771C18.6374 7.08146 18.75 7.28296 18.75 7.5C18.75 7.84518 18.4702 8.125 18.125 8.125H1.875C1.65796 8.125 1.45646 8.0124 1.34272 7.82756C1.16181 7.53359 1.25347 7.14862 1.54744 6.96771L9.67244 1.96771ZM4.08315 6.875L10 3.23386L15.9169 6.875H4.08315Z" fill="black"/> <path d="M3.75 7.5V13.75C3.75 14.0952 4.02982 14.375 4.375 14.375C4.72018 14.375 5 14.0952 5 13.75V7.5C5 7.15482 4.72018 6.875 4.375 6.875C4.02982 6.875 3.75 7.15482 3.75 7.5Z" fill="black"/> <path d="M7.5 7.5V13.75C7.5 14.0952 7.77982 14.375 8.125 14.375C8.47018 14.375 8.75 14.0952 8.75 13.75V7.5C8.75 7.15482 8.47018 6.875 8.125 6.875C7.77982 6.875 7.5 7.15482 7.5 7.5Z" fill="black"/> <path d="M11.25 7.5V13.75C11.25 14.0952 11.5298 14.375 11.875 14.375C12.2202 14.375 12.5 14.0952 12.5 13.75V7.5C12.5 7.15482 12.2202 6.875 11.875 6.875C11.5298 6.875 11.25 7.15482 11.25 7.5Z" fill="black"/> <path d="M15 7.5V13.75C15 14.0952 15.2798 14.375 15.625 14.375C15.9702 14.375 16.25 14.0952 16.25 13.75V7.5C16.25 7.15482 15.9702 6.875 15.625 6.875C15.2798 6.875 15 7.15482 15 7.5Z" fill="black"/> <path d="M2.5 14.375H17.5C17.8452 14.375 18.125 14.0952 18.125 13.75C18.125 13.4048 17.8452 13.125 17.5 13.125H2.5C2.15482 13.125 1.875 13.4048 1.875 13.75C1.875 14.0952 2.15482 14.375 2.5 14.375Z" fill="black"/> <path d="M1.25 16.875H18.75C19.0952 16.875 19.375 16.5952 19.375 16.25C19.375 15.9048 19.0952 15.625 18.75 15.625H1.25C0.904822 15.625 0.625 15.9048 0.625 16.25C0.625 16.5952 0.904822 16.875 1.25 16.875Z" fill="black"/>',
  '<path d="M6.87499 4.375V15.625C6.87499 15.9702 7.15481 16.25 7.49999 16.25C7.84516 16.25 8.12499 15.9702 8.12499 15.625V4.375C8.12499 4.02982 7.84516 3.75 7.49999 3.75C7.15481 3.75 6.87499 4.02982 6.87499 4.375Z" fill="black"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M1.25001 15V13.0625C1.25001 13.0625 1.24754 12.6177 1.53188 12.2711C1.53188 12.2711 1.81623 11.9246 2.25635 11.8395C2.25635 11.8395 2.89751 11.7032 3.31723 11.1851C3.31723 11.1851 3.73695 10.6669 3.73695 10C3.73695 10 3.73695 9.33315 3.31723 8.81495C3.31723 8.81495 2.89751 8.29675 2.2452 8.15825C2.2452 8.15825 1.81623 8.0754 1.53188 7.72885C1.53188 7.72885 1.24754 7.38231 1.25002 6.93404L1.25001 5C1.25001 5 1.25001 4.48223 1.61612 4.11612C1.61612 4.11612 1.98224 3.75 2.50001 3.75H17.5C17.5 3.75 18.0178 3.75 18.3839 4.11612C18.3839 4.11612 18.75 4.48223 18.75 5V6.9375C18.75 6.9375 18.7525 7.38231 18.4681 7.72885C18.4681 7.72885 18.1838 8.0754 17.7437 8.16051C17.7437 8.16051 17.1025 8.29675 16.6828 8.81495C16.6828 8.81495 16.2631 9.33314 16.2631 10C16.2631 10 16.2631 10.6669 16.6828 11.1851C16.6828 11.1851 17.1025 11.7032 17.7548 11.8418C17.7548 11.8418 18.1838 11.9246 18.4681 12.2711C18.4681 12.2711 18.7525 12.6177 18.75 13.066L18.75 15C18.75 15 18.75 15.5178 18.3839 15.8839C18.3839 15.8839 18.0178 16.25 17.5 16.25H2.50001C2.50001 16.25 1.98224 16.25 1.61612 15.8839C1.61612 15.8839 1.25001 15.5178 1.25001 15ZM2.50001 15H17.5L17.5 13.0652C17.5 13.0652 17.4983 13.0651 17.4952 13.0645C17.4952 13.0645 16.4098 12.834 15.7114 11.9718C15.7114 11.9718 15.0131 11.1096 15.0131 10C15.0131 10 15.0131 8.89042 15.7114 8.02819C15.7114 8.02819 16.4078 7.16845 17.5 6.93459V5H2.50001L2.5 6.93476C2.5 6.93476 2.50171 6.93486 2.50482 6.9355C2.50482 6.9355 3.5902 7.16596 4.28858 8.02819C4.28858 8.02819 4.98695 8.89042 4.98695 10C4.98695 10 4.98695 11.1096 4.28858 11.9718C4.28858 11.9718 3.59222 12.8315 2.50001 13.0654V15Z" fill="black"/>',
];

// Function to hide search results after a delay
const hideResults = () => {
  setTimeout(() => {
    active.value = false;
  }, 100); // delay in milliseconds
};

// Function to perform search using Algolia
const search = async () => {
  if (query.value.trim() === "") {
    searchResults.value = [];
    return;
  }
  await client
    .search([
      {
        indexName: "users",
        params: {
          query: query.value,
          hitsPerPage: 10, // Limit to 10 results
        },
      },
      {
        indexName: "clubs",
        params: {
          query: query.value,
          hitsPerPage: 10, // Limit to 10 results
        },
      },
      {
        indexName: "events",
        params: {
          query: query.value,
          hitsPerPage: 10, // Limit to 10 results
        },
      },
    ])
    .then(({ results }) => {
      const processedResults = results.map((result, index) => {
        return result.hits.map((hit) => {
          let display, link;
          if (index === 0) {
            display = `${hit.name} ${hit.surname}`;
            link = "/profile/" + hit.path.split("/")[1];
          } else if (index === 1) {
            display = hit.name;
            link = "/clubs/" + hit.path.split("/")[1];
          } else if (index === 2) {
            console.log(hit);
            display = `${hit.name} (${hit.season})`;
            link = "/events/" + hit.path.split("/")[1];
          }
          return {
            ...hit,
            display,
            link,
            collection: index,
          };
        });
      });
      searchResults.value = processedResults[0]
        .concat(processedResults[1])
        .concat(processedResults[2]);
    });
};

// Computed property for placeholder text
const placeholder = computed(() => {
  if (user.uid == null) {
    return "Prihláste sa pre vyhľadávanie";
  } else if (!user.role || user.role === "user") {
    return "Vyhľadávanie zatial nie je dostupné";
  } else {
    return "Hľadať používateľov a kluby";
  }
});

// Add handleClick function
const handleClick = (result) => {
  console.log("Clicked on", result);
  query.value = "";
  active.value = false;
  // Optionally navigate can be handled here if needed
};
</script>

<template>
  <div
    class="grid grid-cols-[auto_1fr] gap-3 w-full h-10 border-2 rounded-[1.25rem] px-4 items-center sm:relative">
    <img src="../assets/icons/search.svg" alt="search" class="h-5" />
    <input
      v-model="query"
      @input="search"
      @focusout="hideResults"
      @focus="active = true"
      :disabled="user.uid == null || !user.role || user.role === 'user'"
      type="text"
      :placeholder="placeholder"
      class="w-full outline-none bg-transparent placeholder-black mt-1 h-auto disabled:placeholder-grey" />
    <div
      v-if="active && searchResults.length > 0"
      id="searchResults"
      class="absolute max-h-52 overflow-y-auto scrollbar-hidden flex flex-col w-[calc(100dvw-2.5rem)] sm:w-full left-5 sm:left-0 bg-white top-14 sm:top-10 border-black border-2 rounded-[1.25rem] gap-2 py-2 px-4">
      <router-link
        v-for="result in searchResults"
        :key="result.objectID"
        :to="result.link"
        @click="handleClick(result)"
        class="grid grid-cols-[auto_1fr] gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          class="h-5 w-5"
          v-html="icons[result.collection]"></svg>
        <p class="">{{ result.display }}</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
#searchResults {
  z-index: 100;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  /* Animation, transition from opacity 0 to 100 and from vertical -10% to 0 */
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
