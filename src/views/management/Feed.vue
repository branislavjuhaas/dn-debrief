<script setup>
import { ref, onMounted, computed } from "vue"; // Add import for computed
import Field from "../../components/Field.vue";
import { getAllMessages, deleteMessage } from "../../firebase/messaging.js";
import { useLoadingStore } from "../../stores.js";

const loadingStore = useLoadingStore();
const messages = ref([]);
const clubs = ref([]);
const quickFilter = ref(""); // Add quickFilter

const fetchMessages = async () => {
  loadingStore.loadingStart();
  const allMessages = await getAllMessages();
  messages.value = allMessages.map((message) => {
    const club = clubs.value.find((club) => club.id === message.filters.club);
    return {
      ...message,
      filters: {
        ...message.filters,
        club: club ? club.name : "",
      },
    };
  });
  loadingStore.loadingEnd();
};

const deleteExistingMessage = async (id) => {
  await deleteMessage(id);
  messages.value = messages.value.filter((msg) => msg.id !== id);
};

const filteredMessages = computed(() => {
  // Add filteredMessages
  if (!quickFilter.value) return messages.value;
  return messages.value.filter(
    (message) =>
      message.title.toLowerCase().includes(quickFilter.value.toLowerCase()) ||
      message.message.toLowerCase().includes(quickFilter.value.toLowerCase()),
  );
});

onMounted(async () => {
  await fetchMessages();
});
</script>

<template>
  <div class="gap-4">
    <h1>Správa obsahu</h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div class="flex flex-col gap-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <field v-model="quickFilter" label="Filter" />
          <!-- Add filter input -->
          <router-link to="/feed/new" class="form-primary vertical-center">
            <span>Vytvoriť príspevok</span>
          </router-link>
        </div>
        <h2 class="font-bold my-4">Zoznam príspevkov</h2>
        <div
          v-for="message in filteredMessages"
          :key="message.id"
          class="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_2fr_auto] grid-rows-2 items-center gap-4 rounded-[1.25rem] border-2 border-black px-5 h-22 py-3">
          <p class="truncate col-start-1 md:col-span-1">
            <span class="font-bold">Názov</span>
            {{ message.title }}
          </p>
          <p class="truncate col-start-1 md:col-start-2 md:col-span-1">
            <span class="font-bold">Obsah</span>
            {{ message.message }}
          </p>
          <p class="truncate md:row-start-2 col-start-1 md:col-span-2">
            <span class="font-bold">Odkaz</span>
            {{ message.link }}
          </p>
          <router-link
            :to="`/feed/${message.id}/edit`"
            class="w-5 h-5 col-start-2 md:col-start-3 row-start-1 -mt-1">
            <img src="./../../assets/icons/edit.svg" alt="delete" class="w-5" />
          </router-link>
          <button
            class="w-5 h-5 col-start-2 md:col-start-3 row-start-2 -mt-1"
            @click="deleteExistingMessage(message.id)">
            <img
              src="./../../assets/icons/cross.svg"
              alt="delete"
              class="w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
