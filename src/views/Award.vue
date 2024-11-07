<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { translateAwardCategory } from "../translate.js";
import { getAwardById } from "../firebase/awards.js";
import { useUserStore } from "../stores.js";
import Dropdown from "../components/Dropdown.vue";

// State variables
const award = ref(null);
const isLegendary = ref(false);
const userStore = useUserStore();
const route = useRoute();

/**
 * Fetch the award details by ID and set the award state.
 * If the user has the legendary version of the award, set isLegendary to true.
 */
const fetchAward = async () => {
  const awardId = route.params.id;
  award.value = await getAwardById(awardId);

  if (userStore.awards.legend.some((userAward) => userAward.id === awardId)) {
    isLegendary.value = true;
  }
};

// Fetch award on component mount or when user role is set
onMounted(() => {
  if (userStore.uid) {
    fetchAward();
  } else {
    const unwatch = watch(
      () => userStore.uid,
      (newUid) => {
        if (newUid) {
          fetchAward();
          unwatch();
        }
      },
    );
  }
});
</script>

<template>
  <div v-if="award" class="gap-4">
    <h1 class="text-5xl font-bold mb-2">
      {{ isLegendary ? award.legendary.title : award.regular.title }}
    </h1>
    <div
      class="flex flex-col sm:grid sm:grid-cols-[auto_1fr] justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div
        class="flex flex-col sm:aspect-square h-64 sm:h-auto justify-center items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-32 w-32"
          viewBox="0 0 20 20"
          v-html="award.symbol" />
      </div>
      <div class="flex flex-col justify-between text-left gap-16">
        <div class="flex flex-col gap-4 text-black">
          <p>
            <b>Popis:</b>
            {{
              isLegendary
                ? award.legendary.description
                : award.regular.description
            }}
          </p>
          <p>
            <b>Kategória:</b>
            {{ translateAwardCategory(award.category) }}
          </p>
        </div>
        <div class="flex justify-end">
          <Dropdown
            class="w-full"
            :name="'awardType'"
            :label="'Typ ocenenia'"
            :options="['Obyčajné', 'Legendárne']"
            :modelValue="isLegendary ? 'Legendárne' : 'Štandardné'"
            @update:modelValue="
              (value) => (isLegendary = value === 'Legendárne')
            " />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
