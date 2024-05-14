<script setup>
import { ref, onMounted, computed } from "vue";

const searchInput = ref(null);
const searchInputRef = ref(null);

/**
 * This is a lifecycle hook that is called after the component is mounted.
 * It sets the value of `searchInput` and `searchInputRef` to the DOM element with the id `search-input`.
 * This is done to have a reference to the search input field in the component's setup script.
 */
onMounted(() => {
  searchInput.value = document.getElementById("search-input");
  searchInputRef.value = document.getElementById("search-input");
});

/**
 * The `focusInput` function is an event handler for click events on the search div.
 * It checks if the event target is the child object with id `context-panel`.
 * If it is, the function returns immediately and does not execute the rest of the code.
 * If the event target is not the child object with id `context-panel`, the function focuses the search input field.
 *
 * @param {Event} event - The click event object.
 */
const focusInput = (event) => {
  // Check if the event target is the child object with id `context-panel`.
  if (event.target.id === "context-panel") {
    // If it is, return immediately and do not execute the rest of the code.
    return;
  }
  // If the event target is not the child object with id `context-panel`, focus the search input field.
  searchInput.value.focus();
};

/**
 * A computed property that returns a placeholder text for the search input field.
 * The placeholder text changes based on the width of the search input field.
 * If the width is less than 340px, it returns "Hľadať". Otherwise, it returns "Hľadať podujatia, tímy, kluby".
 *
 * @returns {string} The placeholder text for the search input field.
 */
const placeholderText = computed(() => {
  // Get the width of the search input field. If the field is not yet available (e.g., before mounting), use 0 as the default width.
  const width = searchInputRef.value ? searchInputRef.value.offsetWidth : 0;

  // Return the appropriate placeholder text based on the width of the search input field.
  return width < 340 ? "Hľadať" : "Hľadať podujatia, tímy, kluby";
});

const data = ref([
  {
    id: 1,
    name: "Podujatie 1",
    type: "event",
  },
  {
    id: 2,
    name: "Podujatie 2",
    type: "event",
  },
  {
    id: 3,
    name: "Tím 1",
    type: "team",
  },
  {
    id: 4,
    name: "Tím 2",
    type: "team",
  },
  {
    id: 5,
    name: "Klub 1",
    type: "club",
  },
  {
    id: 6,
    name: "Klub 2",
    type: "club",
  },
]);
</script>

<template>
  <div id="search" @click="focusInput">
    <img src="./../assets/icons/Search-r.svg" alt="Search" />
    <input type="text" id="search-input" :placeholder="placeholderText" />
    <div id="context-panel"></div>
  </div>
</template>

<style scoped>
#search {
  width: calc(100% - 2.5rem);
  max-width: 29rem;
  height: 1.25rem;
  border-radius: 1.25rem;
  border: var(--sda-black) 0.125rem solid;
  padding: 0.625rem 1.125rem;
  display: grid;
  grid-template-columns: 1.25rem 1fr;
  column-gap: 0.625rem;
  cursor: text;
}

input[type="text"] {
  margin-left: 0.625rem;
  height: 100%;
  border: none;
  font-family: "Epilogue", sans-serif;
  font-size: 1rem;
  width: calc(100% - 1.125rem);
}

input[type="text"]:focus {
  outline: none;
}

#context-panel {
  position: absolute;
  width: 31rem;
  height: 100px;
  background: var(--sda-white);
  left: calc(50% - 15.5rem - 2px);
  top: 3.5rem;
  border-radius: 1.25rem;
  border: 2px solid var(--sda-black);
  overflow: hidden;
  cursor: default;
  height: 0;
  opacity: 0;
}

@media screen and (max-width: 53.125rem) {
  #context-panel {
    width: calc(100% - 2.5rem);
    left: 1.25rem;
  }
}
</style>
