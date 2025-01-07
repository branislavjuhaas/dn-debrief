<script setup>
import { ref, watch } from "vue";
import Toggle from "../../components/Toggle.vue";
import Dropdown from "../../components/Dropdown.vue";

const mode = ref(window.location.hash.slice(1) || "events");
const onlyMy = ref(false);

const setMode = (newMode) => {
  mode.value = newMode;
  window.location.hash = newMode;
};
</script>

<template>
  <div class="gap-4">
    <h1>Správa podujatí</h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <dropdown
          v-model="mode"
          :options="[
            { text: 'Knižnica podujatí', value: 'events' },
            { text: 'Knižnica súborov', value: 'files' },
          ]"
          label="Zobraziť" />
        <template v-if="mode === 'events'">
          <toggle v-model="onlyMy" label="Iba mnou vytvorené" />
          <router-link to="events/new" class="form-primary vertical-center">
            <span>Vytvoriť podujatie</span>
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
