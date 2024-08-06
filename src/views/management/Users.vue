<script setup>
import { useUserStore } from "../../stores.js";
import Dropdown from "../../components/Dropdown.vue";
import { onMounted, ref } from "vue";
import { getClubs } from "../../firebase/structure.js";
import { useRoute } from "vue-router";
const props = defineProps(["filter"]);

const route = useRoute();

const clubFilter = ref("");

const currentClub = ref("...");
const clubsNames = ref([]);
onMounted(async () => {
  const [clubs] = await Promise.all([getClubs(false)]);
  // If filtered, get the club with params filter. filter param is a clubs id
  if (props.filter) {
    currentClub.value = clubs.find(
      (club) => club.id === route.params.filter,
    ).name;
  }

  clubsNames.value = clubs.map((club) => club.name);

  console.log(currentClub.value);

  console.log(clubsNames.value);
});
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{
        !props.filter ? "Zoznam používateľov" : "Debatný klub " + currentClub
      }}
    </h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div v-if="props.filter"></div>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <dropdown
          label="Debatný klub"
          :options="clubsNames"
          v-model="clubFilter" />
        <button class="form-primary vertical-center">
          <span>Exportovať vo formáte excel</span>
        </button>
      </div>
      <table class="w-full table-fixed">
        <thead>
          <tr>
            <th>Meno</th>
            <th>Priezvisko</th>
            <th>Email</th>
            <th>Role</th>
            <th>Debatný klub</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Barbora</td>
            <td>Svitková</td>
            <td>svitkovabarbora@gmail.com</td>
            <td>admin</td>
            <td>SDA</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
th {
  @apply font-bold text-left p-2;
}

td {
  @apply text-left overflow-hidden p-2 truncate;
}
</style>
