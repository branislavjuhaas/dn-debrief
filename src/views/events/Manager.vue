<script setup>
import { onMounted, ref } from "vue";
import Toggle from "../../components/Toggle.vue";
import Dropdown from "../../components/Dropdown.vue";
import { relevantEvents, uploadEventFile } from "../../firebase/events.js";
import { useLoadingStore, useUserStore } from "../../stores.js";
import Field from "../../components/Field.vue";
import Files from "./Files.vue";

const filesErrorMessage = ref("");

const mode = ref(window.location.hash.slice(1) || "events");
const onlyMyEvents = ref(false);
const onlyMyFiles = ref(false);
const fromDate = ref(new Date().toISOString().split("T")[0]);
const toDate = ref(new Date().toISOString().split("T")[0]);
const region = ref("");
const filesFilter = ref("");

const fetchedEvents = ref([]);

const loadingStore = useLoadingStore();

console.log(fromDate.value, toDate.value);

const setMode = () => {
  window.location.hash = mode.value;
};

const userStore = useUserStore();

onMounted(async () => {
  fetchedEvents.value = await relevantEvents();
  toDate.value = fetchedEvents.value
    ? fetchedEvents.value[fetchedEvents.value.length - 1].endDate
        .toISOString()
        .split("T")[0]
    : new Date().toISOString().split("T")[0];
});

const uploadFile = async () => {
  const file = await new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    // Set filter in dialog to only for supported file types (pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png)
    input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png|*";
    input.onchange = () => resolve(input.files[0]);
    input.click();
  });

  loadingStore.loadingStart();

  uploadEventFile(file, userStore.uid, userStore.fullName)
    .then((path) => {
      filesRef.value.addFile(file.name, path);
      loadingStore.loadingEnd();
    })
    .catch((error) => {
      console.error(error);
      loadingStore.loadingEnd();
      if (error.code === "storage/limit-exceeded") {
        filesErrorMessage.value = "Maximálna veľkosť súboru je 10 MB.";
      } else if (error.code === "storage/unauthorized") {
        filesErrorMessage.value = "Nemáte oprávnenie na nahrávanie súborov.";
      } else {
        filesErrorMessage.value = "Nastala chyba pri nahrávaní súboru.";
      }
    });
};

const filesRef = ref(null);
</script>

<template>
  <div class="gap-4">
    <h1>Správa podujatí - {{ mode === "events" ? "Podujatia" : "Súbory" }}</h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <dropdown
          v-model="mode"
          :options="[
            { text: 'Podujatia', value: 'events' },
            { text: 'Súbory', value: 'files' },
          ]"
          @update:model-value="setMode"
          label="Zobraziť" />
        <template v-if="mode === 'events'">
          <div
            class="grid grid-cols-[auto_auto_1fr_auto_auto] sm:col-span-2 h-12 w-full border-2 border-black rounded-[1.25rem] justify-between px-5 vertical-center truncate items-center">
            <p class="mr-2 font-bold">od</p>
            <input type="date" v-model="fromDate" />
            <p class="col-start-4 mr-2 font-bold">od</p>
            <input type="date" v-model="toDate" />
          </div>
          <toggle v-model="onlyMyEvents" label="Len moje podujatia" />
          <dropdown
            :options="[
              { text: 'Stredoslovenský', value: 'ss' },
              { text: 'Západoslovenský', value: 'sz' },
              { text: 'Východoslovenský', value: 'sv' },
              { text: 'Všetky podujatia', value: '' },
            ]"
            label="Región"
            v-model="region" />
          <router-link to="events/new" class="form-primary vertical-center">
            <span>Vytvoriť podujatie</span>
          </router-link>
        </template>
        <template v-else>
          <toggle v-model="onlyMyFiles" label="Len mnou vytvorené" />
          <button class="form-primary vertical-center" @click="uploadFile">
            <span>Nahrať súbor</span>
          </button>
          <field
            v-model.trim="filesFilter"
            label="Filter"
            type="text"
            class="col-span-full" />
        </template>
      </div>
      <p
        v-if="mode === 'files' && filesErrorMessage"
        class="text-red w-full text-center font-bold">
        {{ filesErrorMessage }}
      </p>
      <files
        v-if="mode === 'files'"
        ref="filesRef"
        :onlyMyFiles="onlyMyFiles"
        :filter="filesFilter" />
    </div>
  </div>
</template>

<style scoped></style>
