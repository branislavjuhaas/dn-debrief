<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getUser } from "../../firebase/auth.js";
import { translateKey, translateRole } from "../../translate.js";

const route = useRoute();

const userData = ref([]);
const userFullName = ref("");

function formatUserData(uid, user) {
  return [
    { name: "uid", value: uid },
    { name: "role", value: translateRole(user.role ?? "user") },
    { name: "club", value: user.club ? user.club.name : null },
    {
      name: "member",
      value: user.seasons.some(
        (season) => season.year === new Date().getFullYear().toString(),
      )
        ? "Áno"
        : "Nie",
    },
    { name: "phone", value: user.phone },
    { name: "email", value: user.email },
    { name: "address", value: user.address },
    { name: "birthdate", value: user.birthdate },
    { name: "supervisor", value: user.supervisor },
    { name: "supervisorEmail", value: user.supervisorEmail },
  ].filter((item) => item.value !== null && item.value !== undefined);
}

const updateUserData = async () => {
  const userId = route.params.uid;
  const user = await getUser(userId);
  userData.value = formatUserData(userId, user);
  userFullName.value = `${user.name} ${user.surname}`;
};

onMounted(updateUserData);

watch(() => route.params.uid, updateUserData);
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{ userFullName }}
    </h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="data in userData"
          :key="data.name"
          class="flex flex-row justify-between h-12 px-5 items-center text-black vertical-center">
          <p class="font-bold">{{ translateKey(data.name) }}</p>
          <p>{{ data.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}
</style>
