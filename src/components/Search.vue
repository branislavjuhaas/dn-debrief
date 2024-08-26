<script setup>
import { useUserStore } from "../stores.js";
import { algoliasearch } from "algoliasearch";
import { computed, ref } from "vue";

const client = algoliasearch("U5G7D0PYJI", "fb0fca02a68ac3af713e1695b6b7888e");

const searchResults = ref([]);
const active = ref(false);

const clubs = ref([]);

// Array of svg paths for icons
const icons = [
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.2692 5.73333C12.2692 6.95327 11.2668 7.96667 10 7.96667C8.73318 7.96667 7.73077 6.95327 7.73077 5.73333C7.73077 4.5134 8.73318 3.5 10 3.5C11.2668 3.5 12.2692 4.5134 12.2692 5.73333ZM13.7692 5.73333C13.7692 7.7952 12.0817 9.46667 10 9.46667C7.91832 9.46667 6.23077 7.7952 6.23077 5.73333C6.23077 3.67147 7.91832 2 10 2C12.0817 2 13.7692 3.67147 13.7692 5.73333ZM8.46342 12.0333H11.5366C13.6689 12.0333 15.5 13.851 15.5 16.2222C15.5 16.3188 15.4636 16.3929 15.4181 16.4403C15.3735 16.4867 15.33 16.5 15.2927 16.5H4.70732C4.67003 16.5 4.62647 16.4867 4.58194 16.4403C4.5364 16.3929 4.5 16.3188 4.5 16.2222C4.5 13.851 6.33108 12.0333 8.46342 12.0333ZM3 16.2222C3 13.0803 5.44606 10.5333 8.46342 10.5333H11.5366C14.5539 10.5333 17 13.0803 17 16.2222C17 17.2041 16.2356 18 15.2927 18H4.70732C3.76439 18 3 17.2041 3 16.2222Z" fill="black" />',
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M9.67244 1.96771C9.87332 1.8441 10.1267 1.8441 10.3276 1.96771L18.4526 6.96771C18.6374 7.08146 18.75 7.28296 18.75 7.5C18.75 7.84518 18.4702 8.125 18.125 8.125H1.875C1.65796 8.125 1.45646 8.0124 1.34272 7.82756C1.16181 7.53359 1.25347 7.14862 1.54744 6.96771L9.67244 1.96771ZM4.08315 6.875L10 3.23386L15.9169 6.875H4.08315Z" fill="black"/> <path d="M3.75 7.5V13.75C3.75 14.0952 4.02982 14.375 4.375 14.375C4.72018 14.375 5 14.0952 5 13.75V7.5C5 7.15482 4.72018 6.875 4.375 6.875C4.02982 6.875 3.75 7.15482 3.75 7.5Z" fill="black"/> <path d="M7.5 7.5V13.75C7.5 14.0952 7.77982 14.375 8.125 14.375C8.47018 14.375 8.75 14.0952 8.75 13.75V7.5C8.75 7.15482 8.47018 6.875 8.125 6.875C7.77982 6.875 7.5 7.15482 7.5 7.5Z" fill="black"/> <path d="M11.25 7.5V13.75C11.25 14.0952 11.5298 14.375 11.875 14.375C12.2202 14.375 12.5 14.0952 12.5 13.75V7.5C12.5 7.15482 12.2202 6.875 11.875 6.875C11.5298 6.875 11.25 7.15482 11.25 7.5Z" fill="black"/> <path d="M15 7.5V13.75C15 14.0952 15.2798 14.375 15.625 14.375C15.9702 14.375 16.25 14.0952 16.25 13.75V7.5C16.25 7.15482 15.9702 6.875 15.625 6.875C15.2798 6.875 15 7.15482 15 7.5Z" fill="black"/> <path d="M2.5 14.375H17.5C17.8452 14.375 18.125 14.0952 18.125 13.75C18.125 13.4048 17.8452 13.125 17.5 13.125H2.5C2.15482 13.125 1.875 13.4048 1.875 13.75C1.875 14.0952 2.15482 14.375 2.5 14.375Z" fill="black"/> <path d="M1.25 16.875H18.75C19.0952 16.875 19.375 16.5952 19.375 16.25C19.375 15.9048 19.0952 15.625 18.75 15.625H1.25C0.904822 15.625 0.625 15.9048 0.625 16.25C0.625 16.5952 0.904822 16.875 1.25 16.875Z" fill="black"/>',
];

const hideResults = () => {
  setTimeout(() => {
    active.value = false;
  }, 100); // delay in milliseconds
};

const search = async (query) => {
  await client
    .search([
      {
        indexName: "users",
        params: {
          query: query,
          hitsPerPage: 10, // Limit to 10 results
        },
      },
      {
        indexName: "clubs",
        params: {
          query: query,
          hitsPerPage: 10, // Limit to 10 results
        },
      },
    ])
    .then(({ results }) => {
      const processedResults = results.map((result, index) => {
        return result.hits.map((hit) => {
          let display, link;
          if (index === 0) {
            display = hit.name + " " + hit.surname;
            link = "/profile/" + hit.path.split("/")[1];
          } else if (index === 1) {
            display = hit.name;
            link = "/manage/clubs/" + hit.path.split("/")[1];
          }
          return {
            ...hit,
            display,
            link,
            collection: index,
          };
        });
      });
      searchResults.value = processedResults[0].concat(processedResults[1]);
    });
};

const placeholder = computed(() => {
  if (user.uid == null) {
    return "Prihláste sa pre vyhľadávanie";
  } else if (!user.role || user.role === "user") {
    return "Vyhľadávanie zatial nie je dostupné";
  } else {
    return "Hľadať používateľov a kluby";
  }
});

const user = useUserStore();
</script>

<template>
  <div
    class="grid grid-cols-[auto_1fr] gap-3 w-full h-10 border-2 rounded-[1.25rem] px-4 items-center sm:relative">
    <img src="../assets/icons/search.svg" alt="search" class="h-5" />
    <input
      @input="search($event.target.value)"
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
