<template>
  <ComboboxRoot
    class="sm:relative"
    v-model:open="expanded"
    :disabled="!userStore.isAuthenticated"
  >
    <ComboboxAnchor
      class="w-full flex items-center justify-between rounded-2xl border-2 border-black px-5 h-10 gap-3 bg-white data-[placeholder]:text-grey outline-none data-[disabled]:text-gray"
    >
      <Icon name="ph:magnifying-glass" />
      <ComboboxInput
        class="bg-transparent outline-none h-full w-full mt-0.5"
        :placeholder="
          !userStore.isAuthenticated
            ? 'Pre prístup k vyhľadávaniu sa prihláste'
            : 'Hľadať členov, kluby, podujatia a tímy'
        "
        v-model="searchTerm"
      />
    </ComboboxAnchor>

    <ComboboxContent
      class="absolute max-sm:left-5 z-10 w-[calc(100%-2.5rem)] sm:w-full mt-1 bg-white overflow-hidden rounded-2xl shadow-dialog border-2 border-black will-change-[opacity,transform]"
    >
      <ComboboxViewport class="px-5 py-4">
        <ComboboxEmpty class="pt-1 text-gray">
          Vyhľadávaniu nezodpovedá žiadna položka
        </ComboboxEmpty>

        <ComboboxItem
          v-for="option in options"
          :key="option.name"
          :value="option.name"
          @select.prevent
        >
          <NuxtLink
            :to="`/search/${option.name}`"
            class="flex flex-row items-center gap-2 hover:text-red"
            @click="
              expanded = false;
              searchTerm = '';
            "
          >
            <Icon :name="getIcon(option.type ?? 'ph:question')" />
            <p class="mt-1">
              {{ option.name }}
            </p>
          </NuxtLink>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>

<script setup lang="ts">
const userStore = {
  isAuthenticated: true, // Example authentication state
  fullName: "Branislav Juhás",
  role: "user", // Example role, can be 'admin', 'user', etc.
};

const searchTerm = ref("");
const expanded = ref(false);

const options = [
  { name: "Branislav Juhás", type: "person" },
  { name: "Barbora Svitková", type: "person" },
  { name: "Ján Novák", type: "person" },
  { name: "Sučany", type: "club" },
  { name: "Košice", type: "club" },
  { name: "Bratislava", type: "club" },
  { name: "SUC1", type: "team" },
  { name: "SUC2", type: "team" },
  { name: "SUC3", type: "team" },
  { name: "SUC4", type: "team" },
  { name: "SUC5", type: "team" },
  { name: "SUC6", type: "team" },
  { name: "SUC7", type: "team" },
  { name: "SUC8", type: "team" },
  { name: "3. stredoslovenský regionálny turnaj", type: "event" },
  { name: "4. stredoslovenský regionálny turnaj", type: "event" },
];

// Function to get icon based on type
const getIcon = (type: string) => {
  switch (type) {
    case "person":
      return "ph:user";
    case "club":
      return "ph:bank";
    case "event":
      return "ph:ticket";
    case "team":
      return "ph:users-three";
    default:
      return "ph:question";
  }
};
</script>

<style scoped></style>
