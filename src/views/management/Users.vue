<script setup>
import { useLoadingStore, useUserStore } from "../../stores.js";
import Dropdown from "../../components/Dropdown.vue";
import { computed, onMounted, ref } from "vue";
import { getClubs } from "../../firebase/structure.js";
import { useRoute } from "vue-router";
import { getUsers } from "../../firebase/structure.js";
import { translateRole } from "../../translate.js";
import Field from "../../components/Field.vue";

const props = defineProps(["filter"]);

useLoadingStore().loadingStart();

const route = useRoute();

const clubFilter = ref("");
const quickFilter = ref("");

const currentClub = ref("...");
const clubsNames = ref([]);
let clubs = [];
const users = ref([]);

onMounted(async () => {
  clubs = (await Promise.all([getClubs(false)]))[0];
  // If filtered, get the club with params filter. filter param is a clubs id
  if (props.filter) {
    currentClub.value = clubs.find((club) => club.id === route.params.filter);
  }

  clubsNames.value = clubs.map((club) => club.name);

  const [usersData] = await Promise.all([getUsers(currentClub.value.id)]);
  users.value = usersData;

  console.log("Stop");
  useLoadingStore().loadingEnd();
});

const getClubNameById = (id) => {
  return clubs.find((club) => club.id === id).name;
};

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const isClubMatch = clubFilter.value
      ? user.club?.name === clubFilter.value
      : true;

    const isQuickMatch = quickFilter.value
      ? (user.name + " " + user.surname).includes(quickFilter.value) ||
        user.id.includes(quickFilter.value) ||
        (user.role ? user.role.includes(quickFilter.value) : false)
      : true;

    return isClubMatch && isQuickMatch;
  });
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{
        !props.filter
          ? "Zoznam používateľov"
          : "Debatný klub " + currentClub.name
      }}
    </h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div v-if="props.filter"></div>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <dropdown
          label="Debatný klub"
          :options="clubsNames"
          v-model="clubFilter" />
        <field label="Filter" v-model="quickFilter" />
        <button class="form-primary vertical-center">
          <span>Exportovať</span>
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <div
          class="grid grid-rows-1 font-bold gap-4 items-center"
          :class="props.filter ? 'grid-cols-3' : 'grid-cols-4'">
          <p>UID</p>
          <p>Meno a priezvisko</p>
          <p>Role</p>
          <p v-if="!props.filter">Debatný klub</p>
        </div>
        <router-link
          v-for="user in filteredUsers"
          :to="'/user/' + user.id"
          :key="user.id"
          class="grid items-center cursor-pointer gap-4 rounded-[1.25rem] duration-150 transition-all delay-300 hover:py-5 hover:text-red"
          :class="props.filter ? 'grid-cols-3' : 'grid-cols-4'">
          <p class="truncate">{{ user.id }}</p>
          <p class="overflow-hidden sm:truncate">
            {{ user.name + " " + user.surname }}
          </p>
          <p class="overflow-hidden sm:truncate">
            {{ translateRole(user.role) || "Člen" }}
          </p>
          <p class="overflow-hidden sm:truncate" v-if="!props.filter">
            {{ user.club ? getClubNameById(user.club.id) : "Žiadny" }}
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
