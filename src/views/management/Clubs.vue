<script setup>
import Field from "../../components/Field.vue";
import Toggle from "../../components/Toggle.vue";
import { onMounted, ref } from "vue";
import { getClubsWithMembersCount } from "../../firebase/structure.js";
import { useLoadingStore } from "../../stores.js";
import { translateRole } from "../../translate.js";

useLoadingStore().loadingStart();

const newClub = ref("");
const newActive = ref(true);

const clubs = ref([]);

onMounted(async () => {
  const clubsData = await getClubsWithMembersCount();
  clubs.value = clubsData;

  console.log(clubs.value);

  useLoadingStore().loadingEnd();
});

const updateClubStatus = async (clubId, active, event) => {
  event.stopPropagation();
  const { updateClubStatus } = await import("../../firebase/structure.js");
  await updateClubStatus(clubId, active);
};

const createClub = async () => {
  if (!newClub.value) return;

  const { createClub } = await import("../../firebase/structure.js");
  const cid = await createClub(newClub.value, newActive.value);
  clubs.value.push({
    id: cid,
    name: newClub.value,
    membersCount: 0,
    active: newActive.value,
  });
  newClub.value = "";
  newActive.value = true;
};
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Zoznam debatných klubov</h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <field label="Názov klubu" v-model="newClub" />
        <toggle label="Aktívny" v-model="newActive" />
        <button @click="createClub" class="form-primary vertical-center">
          <span>Vytvoriť klub</span>
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <div class="grid grid-rows-1 font-bold gap-4 items-center grid-cols-3">
          <p>Názov</p>
          <p>Počet členov</p>
          <p>Aktívny</p>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <router-link
          v-for="club in clubs"
          :to="'/manage/clubs/' + club.id"
          :key="club.id"
          class="grid grid-cols-3 items-center cursor-pointer gap-4 rounded-[1.25rem] duration-150 transition-all delay-300 hover:py-5 hover:text-red">
          <p class="truncate">{{ club.name }}</p>
          <p class="overflow-hidden sm:truncate">
            {{ club.membersCount }}
          </p>
          <p
            @click.prevent="
              updateClubStatus(club.id, !club.active, $event);
              club.active = !club.active;
            "
            class="overflow-hidden underline sm:truncate">
            {{ club.active ? "Áno" : "Nie" }}
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
