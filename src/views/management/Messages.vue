<script setup>
import { ref, onMounted } from "vue";
import Field from "../../components/Field.vue";
import Toggle from "../../components/Toggle.vue";
import Dropdown from "../../components/Dropdown.vue";
import { getAllMessages, createMessage, editMessage, deleteMessage } from "../../firebase/messaging.js";
import { getClubs } from "../../firebase/structure.js";
import { useLoadingStore } from "../../stores.js";

const loadingStore = useLoadingStore();
const messages = ref([]);
const clubs = ref([]);
const newMessage = ref({
  title: "",
  message: "",
  link: "",
  local: false,
  filters: {
    member: false,
    club: "",
    role: null,
  },
});

const fetchMessages = async () => {
  loadingStore.loadingStart();
  const allMessages = await getAllMessages();
  messages.value = allMessages.map(message => {
    const club = clubs.value.find(club => club.id === message.filters.club);
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

const fetchClubs = async () => {
  clubs.value = await getClubs(false);
};

const saveMessage = async () => {
  newMessage.value.filters.role = null; // Ensure role is always null
  newMessage.value.filters.member = false; // Ensure member is always false
  const club = clubs.value.find(club => club.name === newMessage.value.filters.club);
  newMessage.value.filters.club = club ? club.id : "";
  const createdMessage = await createMessage(newMessage.value);
  messages.value.push(createdMessage);
  resetForm();
};

const editExistingMessage = async (message) => {
  await editMessage(newMessage.value.id, newMessage.value);
    const index = messages.value.findIndex(msg => msg.id === newMessage.value.id);
    if (index !== -1) {
      messages.value[index] = { ...newMessage.value };
    }
};

const deleteExistingMessage = async (id) => {
  await deleteMessage(id);
  messages.value = messages.value.filter(msg => msg.id !== id);
};

const resetForm = () => {
  newMessage.value = {
    title: "",
    message: "",
    link: "",
    local: false,
    filters: {
      member: false,
      club: "",
      role: null,
    },
  };
};

onMounted(async () => {
  await fetchClubs();
  await fetchMessages();
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Správa obsahu</h1>
    <div class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <field label="Názov" v-model="newMessage.title" />
        <field label="Obsah" v-model="newMessage.message" />
        <field label="Odkaz" v-model="newMessage.link" />
        <toggle label="Lokálny odkaz" v-model="newMessage.local" />
        <dropdown label="Klub" :options="clubs.map(club => club.name)" v-model="newMessage.filters.club" />
        <button @click="saveMessage" class="form-primary vertical-center">
          <span>Pridať správu</span>
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <p class="flex mx-6 font-bold">
          Existujúce správy
        </p>
        <div v-for="message in messages" :key="message.id" class="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 rounded-[1.25rem]">
          <field label="Názov" v-model="message.title" />
          <field label="Obsah" v-model="message.message" />
          <field label="Odkaz" v-model="message.link" />
          <div class="flex gap-2">
            <button @click="editExistingMessage(message)" class="form-secondary vertical-center w-full">
              <span>Upraviť</span>
            </button>
            <button @click="deleteExistingMessage(message.id)" class="form-secondary vertical-center w-full">
              <span>Vymazať</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>