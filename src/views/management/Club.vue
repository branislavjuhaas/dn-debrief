<script setup>
// Import necessary components and functions
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getClub, getUsers } from "../../firebase/structure.js";
import { useLoadingStore, useUserStore } from "../../stores.js";
import Field from "../../components/Field.vue";
import { translateRole } from "../../helpers/translate.js";

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

// Watch for changes in route.params.id to update club data and members
watch(
  () => route.params.id,
  async () => {
    clubId.value = route.params.id;
    useLoadingStore().loadingStart();
    try {
      club.value = await getClub(clubId.value);
      members.value = await getUsers(clubId.value);
    } catch (error) {
      console.error(error);
    } finally {
      useLoadingStore().loadingEnd();
    }
  },
);
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
        <field v-model="quickFilter" label="Filter" />
        <div
          class="flex flex-row justify-between h-12 w-full border-2 border-black rounded-[1.25rem] items-center px-5 vertical-center truncate">
          <p>
            <span class="font-bold">Počet členov</span>
            {{
              members.filter((member) =>
                member.seasons.some(
                  (season) =>
                    season.year === new Date().getFullYear().toString() &&
                    season.confirmed,
                ),
              ).length
            }}
          </p>
          <p v-if="club.zdp" class="font-bold">ZDP</p>
        </div>
        <router-link
          v-if="['admin', 'developer'].includes(useUserStore().role)"
          :to="`/clubs/${clubId}/edit`"
          class="form-primary vertical-center">
          <span>Upraviť</span>
        </router-link>
      </div>
      <div class="flex flex-col gap-4">
        <div class="grid grid-rows-1 font-bold gap-4 items-center grid-cols-3">
          <p>UID</p>
          <p>Meno a priezvisko</p>
          <p>Rola</p>
        </div>
        <template v-if="['admin', 'developer'].includes(useUserStore().role)">
          <router-link
            v-for="(member, index) in filteredMembers"
            :key="`admin-${member.id}`"
            :to="`/users/${member.id}`"
            :style="{ '--delay': index * 0.035 + 's' }"
            class="grid grid-cols-3 items-center gap-4 rounded-[1.25rem] fade-in fly-in opacity-0"
            :class="{
              'text-grey': !member.seasons.some(
                (season) =>
                  season.year === new Date().getFullYear().toString() &&
                  season.confirmed,
              ),
            }">
            <p class="truncate">{{ member.id }}</p>
            <p class="overflow-hidden sm:truncate">
              {{ member.name + " " + member.surname }}
            </p>
            <p class="overflow-hidden sm:truncate">
              {{ translateRole(member.role || "user") }}
            </p>
          </router-link>
        </template>
        <template v-else>
          <div
            v-for="(member, index) in filteredMembers"
            :key="member.id"
            :style="{ '--delay': index * 0.035 + 's' }"
            class="grid grid-cols-3 items-center gap-4 rounded-[1.25rem] fade-in fly-in opacity-0"
            :class="{
              'text-grey': !member.seasons.some(
                (season) =>
                  season.year === new Date().getFullYear().toString() &&
                  season.confirmed,
              ),
            }">
            <p class="truncate">{{ member.id }}</p>
            <p class="overflow-hidden sm:truncate">
              {{ member.name + " " + member.surname }}
            </p>
            <p class="overflow-hidden sm:truncate">
              {{ translateRole(member.role || "user") }}
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes flyIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-in forwards;
  animation-delay: var(--delay);
}

.fly-in {
  animation: flyIn 0.5s ease-out forwards;
  animation-delay: var(--delay);
}
</style>
