<script setup>
import { ref, computed, onMounted } from "vue";
import { getRecentUsers, getUserStatistics } from "../../firebase/structure.js";
import { useLoadingStore } from "../../stores.js";
import { translateRole } from "../../translate.js";

const currentYear = new Date().getFullYear();
const exported = ref(false);

const usersLoaded = ref(false);

const totalUsers = ref(1);
const registeredUsers = ref(0);
const confirmedUsers = ref(0);

const recentUsers = ref([]);

const circumference = computed(() => Math.PI * 2 * 45);
const offset = computed(
  () => (totalUsers.value - registeredUsers.value) / totalUsers.value,
);
const confirmedOffset = computed(
  () => (totalUsers.value - confirmedUsers.value) / totalUsers.value,
);

/**
 * Asynchronously exports all users.
 *
 * This function fetches all users and clubs from Firestore, swaps references with their names,
 * resolves dependencies, removes text to save resources, and exports the data to an Excel file.
 */
const exportAll = async () => {
  const ExcelJS = await import("exceljs");
  const { fetchAllUsers, fetchAllClubs } = await import(
    "../../firebase/structure.js"
  );

  useLoadingStore().loadingStart();

  // Fetch all users and clubs
  const [usersData, clubsData] = await Promise.all([
    fetchAllUsers(),
    fetchAllClubs(),
  ]);

  // Create a map of club references to club names
  const clubMap = new Map();
  clubsData.forEach((club) => {
    clubMap.set(club.ref.id, club.name);
  });

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Členovia");

  // Define columns and rows for the table
  const columns = [
    { name: "UID", filterButton: true },
    { name: "Meno", filterButton: true },
    { name: "Priezvisko", filterButton: true },
    { name: "Funkcia", filterButton: true },
    { name: "Debatný klub", filterButton: true },
    { name: "Email", filterButton: true },
    { name: "Telefónne číslo", filterButton: true },
    { name: "Dátum narodenia", filterButton: true },
    { name: "Adresa", filterButton: true },
    { name: "Registrácie", filterButton: true },
    { name: "Registrovaný člen", filterButton: true },
    { name: "Meno a priezvisko zákonného zástupcu", filterButton: true },
    { name: "Email zákonného zástupcu", filterButton: true },
  ];

  const rows = usersData.map((user) => [
    user.uid,
    user.name,
    user.surname,
    translateRole(user.role) || "Používateľ/-ka",
    user.club ? clubMap.get(user.club.id) || "Žiadny" : "Žiadny",
    user.email,
    user.phone,
    user.birthdate,
    user.address,
    (user.seasons || [])
      .filter((season) => season.confirmed)
      .map((season) => season.year)
      .join(", "),
    {
      formula: `IF(ISNUMBER(SEARCH(TEXT(YEAR(TODAY()), "0"), INDIRECT("RC[-1]", 0))), "Áno", "Nie")`,
    },
    user.supervisor,
    user.supervisorEmail,
  ]);

  // Add table to the worksheet
  worksheet.addTable({
    name: "Users",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: columns.map((col) => ({
      name: col.name,
      filterButton: col.filterButton,
    })),
    rows: rows,
  });

  // Set the width of the columns to match the content
  worksheet.columns.forEach((column, index) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength + 2; // Add some padding to the width
  });

  const clubsSheet = workbook.addWorksheet("Debatné kluby"); // Renamed from 'clubs'

  const clubColumns = [
    { header: "Názov", filterButton: true },
    { header: "Aktívny", filterButton: true },
    { header: "Počet členov", filterButton: true },
  ];

  const clubRows = clubsData.map((club) => [
    club.name,
    club.active ? "Áno" : "Nie",
    {
      formula: `COUNTIFS(Users[Debatný klub], "${club.name}", Users[Registrovaný člen], "Áno")`,
    },
  ]);

  clubsSheet.addTable({
    name: "Clubs",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: clubColumns.map((col) => ({
      name: col.header,
      filterButton: col.filterButton,
    })),
    rows: clubRows,
  });

  clubsSheet.columns.forEach((column, index) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength + 2;
  });

  // Create a Blob from the workbook and download it
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "Export-DN-U-" + new Date().toISOString() + ".xlsx";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);

  exported.value = true;
  useLoadingStore().loadingEnd();
};

onMounted(async () => {
  try {
    const {
      totalUsers: total,
      usersCurrentYear: registered,
      usersCurrentYearConfirmed: confirmed,
    } = await getUserStatistics();

    console.log("STATS", total, registered, confirmed);

    totalUsers.value = total;
    registeredUsers.value = registered;
    confirmedUsers.value = confirmed;

    usersLoaded.value = true;
  } catch (error) {
    console.error("Failed to fetch user statistics:", error);
  }

  recentUsers.value = await getRecentUsers();
  console.log(recentUsers.value);
});
</script>

<template>
  <div class="gap-4">
    <h1>Správa používateľov</h1>
    <div
      class="grid sm:grid-cols-[auto_auto_1fr] w-full bg-white text-black min-h-80 h-fit rounded-[1.25rem] p-5 transition-all overflow-auto scrollbar-hidden gap-6">
      <div class="w-80 h-80 relative justify-self-center">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          class="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke-width="10"
            stroke="#00C1F2"
            fill="transparent"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference * offset"
            stroke-linecap="round"
            class="animated-circle" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke-width="10"
            stroke="#E81525"
            fill="transparent"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference * confirmedOffset"
            stroke-linecap="round"
            class="animated-circle" />
        </svg>
        <div
          class="absolute flex flex-col top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-2.5 items-center transition-all duration-300">
          <div class="flex flex-row h-12">
            <h2 class="text-5xl font-bold">
              {{ usersLoaded ? totalUsers : "--" }}
            </h2>
            <img
              src="./../../assets/icons/id.svg"
              alt="verified"
              class="h-12 -mt-1" />
          </div>
          <div class="flex flex-row gap-2" v-if="usersLoaded">
            <div class="flex flex-row h-5 gap-1">
              <p>{{ registeredUsers }}</p>
              <img
                src="./../../assets/icons/unverified.svg"
                alt="verified"
                class="w-5" />
            </div>
            <p>|</p>
            <div class="flex flex-row h-5 gap-1 font-bold">
              <p>{{ confirmedUsers }}</p>
              <img
                src="./../../assets/icons/verified.svg"
                alt="verified"
                class="w-5" />
            </div>
          </div>
        </div>
      </div>
      <div class="w-[2px] h-full bg-black rounded-full hidden sm:flex" />
      <div class="grid grid-rows-[auto_auto_1fr] h-auto gap-4">
        <div class="grid md:grid-cols-2 gap-4 items-center">
          <div
            class="flex flex-row justify-start h-12 w-full items-center text-center md:text-left px-5 vertical-center truncate md:row-start-1 row-start-2">
            <p class="w-full">
              <span class="font-bold w-full">Nedávno vytvorené účty</span>
            </p>
          </div>
          <button
            @click="exportAll"
            class="form-primary vertical-center row-start-1"
            :disabled="exported">
            <span>Exportovať všetkých</span>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-4 font-bold text-left truncate h-auto">
          <p>UID</p>
          <p>Meno a priezvisko</p>
          <p>Stav registrácie</p>
        </div>
        <div
          class="flex flex-col text-left truncate gap-4 w-full h-auto overflow-y-auto scrollbar-hidden">
          <router-link
            v-for="user in recentUsers"
            :key="user.uid"
            :to="`/profile/${user.id}`"
            class="grid grid-cols-3 gap-4 truncate">
            <p class="truncate">{{ user.id }}</p>
            <p class="truncate">{{ user.name }} {{ user.surname }}</p>
            <p class="truncate">
              {{
                !user.seasons
                  ? "Chýba registrácia"
                  : user.seasons.some(
                        (season) =>
                          season.year == currentYear && season.confirmed,
                      )
                    ? "Potvrdená"
                    : user.seasons.some((season) => season.year == currentYear)
                      ? "Nepotvrdená"
                      : "Chýba registrácia"
              }}
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animated-circle {
  transition:
    stroke-dashoffset 0.5s ease,
    stroke-dasharray 0.5s ease;
}
</style>
