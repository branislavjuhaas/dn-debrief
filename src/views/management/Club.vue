<script setup>
// Import necessary components and functions
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getClub, getUsers } from "../../firebase/structure.js";
import { useLoadingStore, useUserStore } from "../../stores.js";
import Field from "../../components/Field.vue";
import { translateRole } from "../../translate.js";

// Define reactive variables for club data, members, and filters
const route = useRoute();
const clubId = ref(route.params.id);
const club = ref("");
const members = ref([]);
const quickFilter = ref("");

// Fetch club data and members on component mount
onMounted(async () => {
  useLoadingStore().loadingStart();
  club.value = await getClub(clubId.value);
  members.value = await getUsers(clubId.value);
  useLoadingStore().loadingEnd();
});

// Implement methods to filter members based on quick filter
const filteredMembers = computed(() => {
  if (!quickFilter.value) return members.value;
  return members.value.filter((member) =>
    `${member.name} ${member.surname}`
      .toLowerCase()
      .includes(quickFilter.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="gap-4">
    <h1>Debatný klub {{ club.name }}</h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div
        class="grid grid-cols-1 gap-4"
        :class="{
          'sm:grid-cols-3': ['admin', 'developer'].includes(
            useUserStore().role,
          ),
          'sm:grid-cols-2': !['admin', 'developer'].includes(
            useUserStore().role,
          ),
        }">
        <field label="Filter" v-model="quickFilter" />
        <div
          class="flex flex-row justify-between h-12 w-full border-2 border-black rounded-[1.25rem] items-center px-5 vertical-center truncate">
          <p>
            <span class="font-bold">Počet členov</span>
            {{ members.length }}
          </p>
          <p v-if="club.zdp" class="font-bold">ZDP</p>
        </div>
        <router-link
          :to="`/clubs/${clubId}/edit`"
          class="form-primary vertical-center"
          v-if="['admin', 'developer'].includes(useUserStore().role)">
          <span>Upraviť</span>
        </router-link>
      </div>
      <div class="flex flex-col gap-4">
        <div class="grid grid-rows-1 font-bold gap-4 items-center grid-cols-3">
          <p>UID</p>
          <p>Meno a priezvisko</p>
          <p>Rola</p>
        </div>
        <router-link
          v-for="member in filteredMembers"
          :key="`admin-${member.id}`"
          :to="`/profile/${member.id}`"
          v-if="['admin', 'developer'].includes(useUserStore().role)"
          class="grid grid-cols-3 items-center gap-4 rounded-[1.25rem]">
          <p class="truncate">{{ member.id }}</p>
          <p class="overflow-hidden sm:truncate">
            {{ member.name + " " + member.surname }}
          </p>
          <p class="overflow-hidden sm:truncate">
            {{ translateRole(member.role || "user") }}
          </p>
        </router-link>
        <div
          v-else
          v-for="member in filteredMembers"
          :key="member.id"
          class="grid grid-cols-3 items-center gap-4 rounded-[1.25rem]">
          <p class="truncate">{{ member.id }}</p>
          <p class="overflow-hidden sm:truncate">
            {{ member.name + " " + member.surname }}
          </p>
          <p class="overflow-hidden sm:truncate">
            {{ translateRole(member.role || "user") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
