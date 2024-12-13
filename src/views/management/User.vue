<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import {
  getUser,
  assignAwardToUser,
  updateAwardLegendStatus,
  removeAwardFromUser,
  updateUserData as updateUserDataInFirebase,
  getClubs,
  updateUserClubManagerStatus,
} from "../../firebase/structure.js";
import router from "../../router.js";
import Dropdown from "../../components/Dropdown.vue";
import Toggle from "../../components/Toggle.vue";
import { useUserStore } from "../../stores.js";
import {
  reverseTranslateRole,
  translateKey,
  translateRole,
} from "../../translate.js";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../main.js";

const route = useRoute();
const userStore = useUserStore();

// Redirect to profile if the user is viewing their own profile
if (userStore.uid === route.params.uid) {
  router.push("/profile");
}

const userData = ref([]);
const userAwards = ref([]);
const availableAwards = ref([]);
const userFullName = ref("");
const userRole = ref("");
const userPending = ref(false);
const showAwardDropdown = ref(false);
const contextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const selectedAward = ref(null);
const isClubManager = ref(false);
let actualRole = "";
const clubs = ref([]);

/**
 * Formats user data for display.
 * @param {string} uid - The user ID.
 * @param {Object} user - The user data.
 * @returns {Array} - The formatted user data.
 */
function formatUserData(uid, user) {
  return [
    { name: "uid", value: uid },
    { name: "club", value: user.club ? user.club.name : null },
    {
      name: "member",
      value:
        user.seasons &&
        user.seasons.some(
          (season) =>
            season.year === new Date().getFullYear().toString() &&
            season.confirmed === true,
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

/**
 * Updates the user data.
 */
const updateUserData = async () => {
  console.log("UPDATING USER DATA");
  const userId = route.params.uid;
  try {
    const user = await getUser(userId);
    userData.value = formatUserData(userId, user);
    actualRole = translateRole(user.role) || "Používateľ/-ka";
    userRole.value = actualRole;
    userFullName.value = `${user.name} ${user.surname}`;
    userPending.value = !!(
      user.seasons &&
      user.seasons.some(
        (season) =>
          season.year === new Date().getFullYear().toString() &&
          season.confirmed === false,
      )
    );

    userAwards.value = (user.awards || []).map((award) => {
      const awardData = availableAwards.value.find(
        (availableAward) => availableAward.id === award.award.id,
      );
      return { ...awardData, legend: !!award.legend };
    });

    isClubManager.value = user.clubManager || false;
  } catch (error) {
    if (error.code === "permission-denied") {
      await router.push("/unauthorized");
    } else {
      console.error(error);
    }
  }
};

/**
 * Fetches available awards.
 */
const getAwards = async () => {
  const { getAllAwards } = await import("../../firebase/awards.js");
  availableAwards.value = await getAllAwards();
};

/**
 * Assigns an award to the user.
 * @param {string} awardId - The award ID.
 */
const assignAward = async (awardId) => {
  try {
    await assignAwardToUser(route.params.uid, awardId);
    // Update local state
    const awardData = availableAwards.value.find(a => a.id === awardId);
    if (awardData) {
      userAwards.value.push({ ...awardData, legend: false });
    }
  } catch (error) {
    console.error("Error assigning award:", error);
  }
};

/**
 * Filters awards based on user role.
 */
const filteredAwards = computed(() => {
  if (userStore.role === "developer") {
    return availableAwards.value;
  } else if (userStore.role === "admin") {
    return availableAwards.value.filter(
      (award) =>
        award.category === "program" || award.category === "organization",
    );
  } else if (userStore.role === "cap") {
    return availableAwards.value.filter(
      (award) => award.category === "program",
    );
  }
  return [];
});

/**
 * Handles right-click on an award.
 * @param {Event} event - The event object.
 * @param {Object} award - The award object.
 */
const handleRightClick = (event, award) => {
  if (userStore.role === "cap" && award.category !== "program") {
    return;
  } else if (
    userStore.role === "admin" &&
    award.category !== "organization" &&
    award.category !== "program"
  ) {
    return;
  }
  event.preventDefault();
  selectedAward.value = award;
  contextMenuPosition.value = { x: event.clientX, y: event.clientY };
  contextMenuVisible.value = true;
};

/**
 * Marks an award as a legend.
 * @param {Object} award - The award object.
 */
const makeLegend = async (award) => {
  try {
    await updateAwardLegendStatus(route.params.uid, award.id, true);
    // Update local state
    const localAward = userAwards.value.find(a => a.id === award.id);
    if (localAward) {
      localAward.legend = true;
    }
  } catch (error) {
    console.error("Error making legend:", error);
  }
  contextMenuVisible.value = false;
};

/**
 * Unmarks an award as a legend.
 * @param {Object} award - The award object.
 */
const unmakeLegend = async (award) => {
  try {
    await updateAwardLegendStatus(route.params.uid, award.id, false);
    // Update local state
    const localAward = userAwards.value.find(a => a.id === award.id);
    if (localAward) {
      localAward.legend = false;
    }
  } catch (error) {
    console.error("Error unmaking legend:", error);
  }
  contextMenuVisible.value = false;
};

/**
 * Removes an award from the user.
 * @param {Object} award - The award object.
 */
const removeAward = async (award) => {
  try {
    await removeAwardFromUser(route.params.uid, award.id);
    // Update local state
    userAwards.value = userAwards.value.filter(a => a.id !== award.id);
  } catch (error) {
    console.error("Error removing award:", error);
  }
  contextMenuVisible.value = false;
};

/**
 * Creates a token for the user.
 * @param {string} userId - The user ID.
 * @returns {string} - The generated token.
 */
const createToken = (userId) => {
  return (userId + new Date().getFullYear().toString())
    .split("")
    .reverse()
    .map((char) => {
      let nextChar;
      if (char === "Z") {
        nextChar = "a".charCodeAt(0);
      } else if (char === "z") {
        nextChar = "0".charCodeAt(0);
      } else if (char === "9") {
        nextChar = "A".charCodeAt(0);
      } else {
        nextChar = char.charCodeAt(0) + 1;
      }
      return String.fromCharCode(nextChar);
    })
    .join("");
};

/**
 * Resends the confirmation email.
 */
const resendConfirmationEmail = async () => {
  const { httpsCallable } = await import("firebase/functions");
  const { functions } = await import("../../main.js");

  const personalized = !userData.value.find(
    (item) => item.name === "supervisor",
  )
    ? `tvoju registráciu`
    : `registráciu tvojho dieťaťa`;

  const emailItem =
    userData.value.find((item) => item.name === "supervisorEmail") ||
    userData.value.find((item) => item.name === "email");
  const uidItem = userData.value.find((item) => item.name === "uid");

  const data = {
    email: emailItem ? emailItem.value : null,
    fullName: userFullName.value,
    token: createToken(uidItem ? uidItem.value : ""),
    personalized: personalized,
  };

  const sendEmailFunction = httpsCallable(functions, "sendEmail");

  sendEmailFunction(data)
    .then((result) => {
      console.log(result.data);
    })
    .catch((error) => {
      const code = error.code;
      const message = error.message;
      const details = error.details;
      console.log(
        `Error Code: ${code}, Message: ${message}, Details: ${details}`,
      );
    });

  userPending.value = false;
  logEvent(analytics, "resend_confiramtion", { method: "Poslať overenie" });
};

/**
 * Confirms the user's registration.
 */
const confirmRegistration = async () => {
  const { updateUserSeasons } = await import("../../firebase/structure.js");

  try {
    await updateUserSeasons(route.params.uid);
  } catch (error) {
    console.error("Error confirming registration:", error);
  }

  userPending.value = false;

  userData.value = userData.value.map((item) => {
    if (item.name === "member") {
      item.value = "Áno";
    }
    return item;
  });
};

// Lifecycle hooks
onMounted(() => {
  getAwards();
  updateUserData();
  getClubs(false).then((data) => {
    clubs.value = data;
  });
});

watch(() => route.params.uid, updateUserData);

watch(userRole, async (newRole, oldRole) => {
  if (newRole === oldRole) return;
  if (newRole === actualRole) return;

  const { updateUserRole } = await import("../../firebase/structure.js");
  await updateUserRole(route.params.uid, reverseTranslateRole(newRole));

  actualRole = newRole;
});

/**
 * Handles left-click on a user data field.
 * @param {Event} event - The event object.
 * @param {Object} data - The user data object.
 */
const handleLeftClickUserData = (event, data) => {
  if (
    (userStore.role !== "admin" && userStore.role !== "developer") ||
    data.name === "uid" ||
    data.name === "email" ||
    data.name === "member" ||
    data.name === "club" ||
    (userStore.role === "admin" && actualRole === "developer")
  ) {
    return;
  }
  event.preventDefault();
  data.editing = true;
  data.originalValue = data.value;
  contextMenuVisible.value = false;
};

/**
 * Saves the edited user data and updates Firebase.
 * @param {Object} data - The user data object.
 */
const saveUserData = async (data) => {
  if (data.value !== data.originalValue) {
    try {
      await updateUserDataInFirebase(route.params.uid, {
        [data.name]: data.value,
      });
      // Update local state without re-fetching
      const localData = userData.value.find(item => item.name === data.name);
      if (localData) {
        localData.value = data.value;
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      data.value = data.originalValue;
    }
  }
  data.editing = false;
};

/**
 * Updates the club manager status for the user.
 */
const updateClubManagerStatus = async () => {
  console.log("MANAGING CLUB");
  try {
    await updateUserClubManagerStatus(route.params.uid, isClubManager.value);
  } catch (error) {
    console.error("Error updating club manager status:", error);
  }
};
</script>

<template>
  <div class="gap-4" @click="contextMenuVisible = false">
    <h1 class="text-5xl font-bold mb-2">
      {{ userFullName }}
    </h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16 transition-all">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="data in userData"
          :key="data.name"
          class="flex flex-row justify-between h-12 px-5 items-center text-black vertical-center"
          @click="handleLeftClickUserData($event, data)">
          <p class="font-bold whitespace-nowrap">
            {{ translateKey(data.name) }}
          </p>
          <input
            v-if="data.editing && data.name !== 'club'"
            v-model="data.value"
            @blur="saveUserData(data)"
            @keyup.enter="saveUserData(data)"
            class="bg-transparent outline-none text-right w-full overflow-hidden" />
          <p v-if="!data.editing" class="text-right">{{ data.value }}</p>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div
          v-if="
            userData.length > 0 &&
            userData.find(
              (data) => data.name === 'member' && data.value === 'Áno',
            )
          "
          class="grid grid-cols-[1fr_auto] gap-4 h-12 px-4 border-2 border-black rounded-[1.25rem] text-black items-center">
          <div
            v-if="userAwards.length > 0"
            class="flex flex-row gap-8 overflow-x-auto scrollbar-hidden">
            <router-link
              v-for="(award, index) in userAwards"
              :to="'/awards/' + award.id"
              :key="award.id"
              class="relative"
              @contextmenu="handleRightClick($event, award)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                :class="{ legend: award.legend }"
                viewBox="0 0 20 20"
                v-html="award.symbol" />
              <div v-if="index < userAwards.length - 1" class="separator" />
            </router-link>
          </div>
          <div v-else class="vertical-center"><p>Žiadne ocenenia</p></div>
          <div class="relative">
            <img
              src="./../../assets/icons/plus.svg"
              alt="Add award"
              class="w-5 h-5 relative cursor-pointer"
              @click="showAwardDropdown = !showAwardDropdown" />
            <div
              v-if="showAwardDropdown"
              class="absolute right-4 top-4 w-auto bg-white z-10 rounded-[1.25rem_0.5rem_1.25rem_1.25rem] border-black border-2 gap-4 p-4 overflow-auto scrollbar-hidden max-h-52 shadow-2xl">
              <div
                v-for="award in filteredAwards.filter(
                  (award) =>
                    !userAwards.find((userAward) => userAward.id === award.id),
                )"
                :key="award.id"
                @click="
                  assignAward(award.id);
                  showAwardDropdown = false;
                ">
                <div
                  class="grid grid-cols-[auto_1fr] w-40 items-center gap-4 cursor-pointer hover:text-red">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    v-html="award.symbol" />
                  <p class="truncate">{{ award.regular.title }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="grid grid-flow-col items-center sm:grid-rows-1 gap-4 sm:grid-cols-4">
          <button
            v-if="
              userPending && ['admin', 'developer'].includes(userStore.role)
            "
            @click="resendConfirmationEmail"
            class="form-secondary vertical-center col-start-1">
            <span>Poslať overenie</span>
          </button>
          <button
            v-if="
              userPending && ['admin', 'developer'].includes(userStore.role)
            "
            @click="confirmRegistration"
            class="form-secondary vertical-center col-start-1 sm:col-start-2">
            <span>Potvrdiť registráciu</span>
          </button>
          <toggle
            v-if="
              userRole &&
              !['Vedúci/-a klubu', 'Používateľ/-ka'].includes(userRole) &&
              !userPending &&
              ['admin', 'developer'].includes(userStore.role)
            "
            class="col-span-1 sm:col-start-2"
            label="Správca klubu"
            v-model="isClubManager"
            @update:modelValue="updateClubManagerStatus" />
          <dropdown
            v-if="userRole && ['admin', 'developer'].includes(userStore.role)"
            class="col-start-1 col-span-1 sm:col-start-3 sm:col-span-2"
            label="Funkcia"
            v-model="userRole"
            :disabled="
              userRole === 'Vývojár' && useUserStore().role === 'admin'
            "
            :options="[
              'Administrátor/-ka',
              'Hlavný/-á rozhodca/-kyňa',
              'Vedúci/-a klubu',
              'Používateľ/-ka',
              'Organizátor/-ka',
              'Junior organizátor/-ka',
              'Tézový výbor',
            ]" />
        </div>
      </div>
    </div>
    <div
      v-if="contextMenuVisible"
      :style="{
        top: `${contextMenuPosition.y}px`,
        left: `${contextMenuPosition.x}px`,
      }"
      class="absolute flex flex-col bg-white shadow-2xl border-2 border-black text-black rounded-[0.5rem_1.25rem_1.25rem_1.25rem] px-4 gap-1 py-2 z-20">
      <p
        v-if="!selectedAward.legend"
        class="cursor-pointer hover:text-red"
        @click="makeLegend(selectedAward)">
        Povýšiť
      </p>
      <p
        v-else
        class="cursor-pointer hover:text-red"
        @click="unmakeLegend(selectedAward)">
        Degradovať
      </p>
      <p
        class="cursor-pointer hover:text-red"
        @click="removeAward(selectedAward)">
        Odstaniť
      </p>
    </div>
  </div>
</template>

<style scoped>
.alternative {
  @apply flex flex-row items-center h-12 bg-white text-black rounded-[1.25rem] border-2 border-red border-opacity-0 font-bold px-5 duration-150 cursor-pointer hover:border-opacity-100;
}

.separator {
  position: absolute;
  right: -1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 1.5rem;
  background-color: black;
  border-radius: 1px;
}

.legend {
  filter: drop-shadow(0 0 5px #ffd900);
}
</style>
