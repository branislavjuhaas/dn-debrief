<script setup>
import { onMounted, ref } from "vue";
import Toggle from "../../components/Toggle.vue";
import { relevantEvents, uploadEventFile } from "../../firebase/events.js";
import { useLoadingStore, useUserStore } from "../../stores.js";
import Field from "../../components/Field.vue";
import Files from "./Files.vue";
import Events from "./Events.vue";

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

const setMode = (newMode) => {
  mode.value = newMode;
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
    .then((eventResponse) => {
      console.log(eventResponse);
      filesRef.value.addFile(eventResponse.fileName, eventResponse.downloadURL);
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
    <div class="flex flex-col gap-[4px]">
      <div class="flex flex-row bg-white rounded-[1.25rem_1.25rem_0_0]">
        <button
          @click="setMode('events')"
          class="tab-button"
          :class="{ 'active-tab': mode === 'events' }">
          Podujatia
        </button>
        <button
          @click="setMode('files')"
          class="tab-button"
          :class="{ 'active-tab': mode === 'files' }">
          Súbory
        </button>
      </div>

      <!-- Tab content -->
      <div
        class="flex flex-col w-full text-black bg-white min-h-60 rounded-[0_0_1.25rem_1.25rem] p-5 gap-8">
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <template v-if="mode === 'events'">
            <toggle
              class="header-control"
              v-model="onlyMyEvents"
              label="Len moje podujatia" />
            <router-link
              to="events/new"
              class="form-primary vertical-center header-control">
              <span>Vytvoriť podujatie</span>
            </router-link>
          </template>
          <template v-else>
            <field
              v-model.trim="filesFilter"
              label="Filter"
              type="text"
              class="header-control" />
            <toggle
              class="header-control"
              v-model="onlyMyFiles"
              label="Len mnou vytvorené" />
            <button
              class="form-primary vertical-center header-control"
              @click="uploadFile">
              <span>Nahrať súbor</span>
            </button>
          </template>
        </div>
        <p
          v-if="mode === 'files' && filesErrorMessage"
          class="text-red w-full text-center font-bold">
          {{ filesErrorMessage }}
        </p>
        <files
          v-show="mode === 'files'"
          ref="filesRef"
          :only-my-files="onlyMyFiles"
          :filter="filesFilter" />
        <events v-show="mode === 'events'" :only-my-events="onlyMyEvents" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-button {
  @apply w-full text-black pt-6 pb-5 px-4;
}

.active-tab {
  @apply font-bold;
}

.header-control {
  @apply w-full;
}
</style>
