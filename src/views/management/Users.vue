<script setup>
// Import necessary components and functions
import { useLoadingStore, useUserStore } from "../../stores.js";
import Dropdown from "../../components/Dropdown.vue";
import { computed, onMounted, ref, watch, reactive } from "vue";
import {
  getClubs,
  getUsers,
  fetchAllUsers,
  fetchAllClubs,
  getUsersPaginated,
} from "../../firebase/structure.js";
import { useRoute, useRouter } from "vue-router";
import { translateRole } from "../../translate.js";
import Field from "../../components/Field.vue";
import router from "../../router.js";

// Define properties
const props = defineProps(["filter"]);

// Define user store
const userStore = useUserStore();

// Start loading
useLoadingStore().loadingStart();

// Define reactive variables
const route = useRoute();
const clubFilter = ref("");
const quickFilter = ref("");
const currentClub = ref("...");
const clubsNames = ref([]);
let clubs = [];
const users = ref([]);
const exported = ref(false);
const registrationYearFilter = ref("");
const years = Array.from(
  {
    length:
      new Date().getFullYear() - 2023 + (new Date().getMonth() >= 8 ? 1 : 0),
  },
  (_, i) => (2024 + i).toString(),
);

// Define reactive variables for pagination
const lastDoc = ref(null);
const hasMoreUsers = ref(true);

// Function to get club name by id
const getClubNameById = (clubData) => {
  const clubId = clubData?.id || clubData; // Handle both object and direct ID cases
  if (!clubId) return "Žiadny";
  const club = clubs.find((club) => club.id === clubId);
  return club ? club.name : "Žiadny";
};

/**
 * Asynchronously exports all users.
 *
 * This function fetches all users and clubs from Firestore, swaps references with their names,
 * resolves dependencies, removes text to save resources, and exports the data to an Excel file.
 */
const exportAll = async () => {
  const ExcelJS = await import("exceljs");

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
      formula: `COUNTIF(Users[Debatný klub], "${club.name}")`,
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

/**
 * Fetches users with pagination when no club filter is applied.
 * Utilizes a stack to manage lastDoc snapshots for navigating between pages.
 */
const fetchUsers = async () => {
  useLoadingStore().loadingStart();

  if (clubFilter.value) {
    // Get club ID by name
    const selectedClub = clubs.find((club) => club.name === clubFilter.value);
    const clubId = selectedClub ? selectedClub.id : null;
    const usersData = getUsers(clubId);
    users.value = usersData;
    hasMoreUsers.value = false;
  } else {
    // Fetch users starting after 'lastDoc', or from the beginning if 'lastDoc' is null
    const { users: newUsers, lastDoc: newLastDoc } = await getUsersPaginated(
      null,
      20,
      lastDoc.value,
    );

    // Append new users to the existing users list
    users.value = users.value.concat(newUsers);

    // Update 'lastDoc' with the last document snapshot
    lastDoc.value = newLastDoc;

    // If fewer than 20 users were fetched, we've reached the end
    if (newUsers.length < 20) {
      hasMoreUsers.value = false;
    }
  }

  useLoadingStore().loadingEnd();
};

// On component mount
onMounted(async () => {
  clubs = (await Promise.all([getClubs(false)]))[0];
  // If filtered, get the club with params filter. filter param is a clubs id
  if (props.filter) {
    currentClub.value = clubs.find((club) => club.id === route.params.filter);
    if (!currentClub.value) {
      useLoadingStore().loadingEnd();
      router.push("/");
      return;
    }
  }

  clubsNames.value = clubs.map((club) => club.name);

  // Initialize users
  users.value = [];
  lastDoc.value = null;
  hasMoreUsers.value = true;

  await fetchUsers();

  useLoadingStore().loadingEnd();
});

// Computed property for filtered users
const filteredUsers = computed(() => {
  const currentYear = new Date().getFullYear().toString();
  return users.value
    .filter((user) => {
      const isClubMatch = clubFilter.value
        ? getClubNameById(user.club) === clubFilter.value
        : true;

      const isQuickMatch = quickFilter.value
        ? (user.name.toLowerCase() + " " + user.surname.toLowerCase()).includes(
            quickFilter.value.toLowerCase(),
          ) ||
          user.id.toLowerCase().includes(quickFilter.value.toLowerCase()) ||
          (user.role
            ? user.role.toLowerCase().includes(quickFilter.value.toLowerCase())
            : false)
        : true;

      const isRegistrationYearMatch = registrationYearFilter.value
        ? Array.isArray(user.seasons) &&
          user.seasons.some(
            (season) =>
              season.year === registrationYearFilter.value && season.confirmed,
          )
        : true;

      return isClubMatch && isQuickMatch && isRegistrationYearMatch;
    })
    .sort((a, b) => {
      const aConfirmed = a.seasons?.some(
        (season) => season.year === currentYear && season.confirmed,
      );
      const bConfirmed = b.seasons?.some(
        (season) => season.year === currentYear && season.confirmed,
      );

      if (aConfirmed && !bConfirmed) return -1;
      if (!aConfirmed && bConfirmed) return 1;
      return 0;
    });
});
</script>

<template>
  <div class="gap-4">
    <h1>
      {{
        !props.filter
          ? "Zoznam používateľov"
          : "Debatný klub " + (currentClub ? currentClub.name : "")
      }}
    </h1>
    <div
      class="flex flex-col w-full text-black bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div v-if="props.filter" class="grid grid-cols-1">
        <field label="Filter" v-model="quickFilter" />
      </div>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <dropdown
          label="Debatný klub"
          :options="clubsNames"
          v-model="clubFilter" />
        <field label="Filter" v-model="quickFilter" />
        <dropdown
          label="Rok registrácie"
          :options="years"
          v-model="registrationYearFilter" />
        <button
          @click="exportAll"
          :disabled="exported"
          class="form-primary vertical-center">
          <span>Exportovať všetko</span>
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <div
          class="grid grid-rows-1 font-bold gap-4 items-center"
          :class="props.filter ? 'grid-cols-3' : 'grid-cols-4'">
          <p>UID</p>
          <p>Meno a priezvisko</p>
          <p>Rola</p>
          <p v-if="!props.filter">Debatný klub</p>
        </div>
        <div
          v-if="
            useUserStore().role !== 'admin' &&
            useUserStore().role !== 'developer'
          "
          v-for="user in filteredUsers"
          :key="user.id"
          class="grid items-center gap-4 rounded-[1.25rem]"
          :class="[
            props.filter ? 'grid-cols-3' : 'grid-cols-4',
            user.seasons?.some(
              (season) =>
                season.year === new Date().getFullYear().toString() &&
                !season.confirmed,
            )
              ? 'text-gray'
              : '',
          ]">
          <p class="truncate">{{ user.id }}</p>
          <p class="overflow-hidden sm:truncate">
            {{ user.name + " " + user.surname }}
          </p>
          <p class="overflow-hidden sm:truncate">
            {{ translateRole(user.role) || "Používateľ/-ka" }}
          </p>
          <p class="overflow-hidden sm:truncate" v-if="!props.filter">
            {{ user.club ? getClubNameById(user.club) : "Žiadny" }}
          </p>
        </div>
        <router-link
          v-else
          v-for="user in filteredUsers"
          :to="'/profile/' + user.id"
          :key="`${user.id}-a`"
          class="grid items-center cursor-pointer gap-4 rounded-[1.25rem] duration-150 transition-all delay-300 hover:py-5 hover:text-red"
          :class="[
            props.filter ? 'grid-cols-3' : 'grid-cols-4',
            user.seasons?.some(
              (season) =>
                season.year === new Date().getFullYear().toString() &&
                !season.confirmed,
            )
              ? 'text-gray'
              : '',
          ]">
          <p class="truncate">{{ user.id }}</p>
          <p class="overflow-hidden sm:truncate">
            {{ user.name + " " + user.surname }}
          </p>
          <p class="overflow-hidden sm:truncate">
            {{ translateRole(user.role) || "Používateľ/-ka" }}
          </p>
          <p class="overflow-hidden sm:truncate" v-if="!props.filter">
            {{ user.club ? getClubNameById(user.club) : "Žiadny" }}
          </p>
        </router-link>
      </div>
    </div>
    <button
      v-if="hasMoreUsers"
      @click="fetchUsers"
      class="alternative vertical-center w-full sm:w-auto">
      <span>Načítať ďalších</span>
    </button>
    <p v-else class="text-center">Všetci používatelia sú načítaní</p>
  </div>
</template>

<style scoped>
.text-gray {
  @apply text-grey;
}

.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black justify-center rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100 disabled:bg-transparent disabled:cursor-default disabled:border-dashed disabled:border-black;
}
</style>
