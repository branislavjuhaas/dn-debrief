<script setup lang="ts">
import NumberFlow from "@number-flow/vue";

const props = defineProps<{
  user: User;
}>();

const initials = computed(() => {
  // If user properties are missing, this falls back safely to an empty string
  const firstName = props.user?.name || "";
  const lastName = props.user?.surname || "";

  const name = `${firstName} ${lastName}`.trim();
  if (!name) return "";

  return name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
});

const displayedId = ref(Math.floor(Math.random() * 1000));

// 2. Animate to the real ID immediately on mount
onMounted(() => {
  displayedId.value = props.user.id;
});
</script>

<template>
  <div
    class="flex flex-col lg:flex-row items-start lg:items-end justify-center sm:justify-between w-full space-y-4">
    <div
      class="flex flex-col sm:flex-row items-center max-sm:self-center space-x-3">
      <span
        class="relative inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle bg-elevated size-25 text-4xl"
        aria-hidden="true">
        <NuxtImg
          v-if="user.image"
          :src="user.image"
          alt=""
          width="100"
          height="100"
          class="h-full w-full rounded-[inherit] object-cover" />

        <span v-else class="font-medium truncate">
          {{ initials }}
        </span>

        <span
          class="absolute text-sm bottom-1 right-1 rounded-full px-2 py-0.5 text-white font-medium ring-2 ring-bg overflow-hidden"
          :class="user.role === 'developer' ? 'id-developer' : 'id-regular'"
          :aria-label="`ID používateľa: ${user.id}`">
          <NumberFlow
            prefix="#"
            :value="displayedId"
            :format="{ useGrouping: false }" />
        </span>
      </span>

      <div class="flex flex-col">
        <h1
          class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted max-sm:text-center">
          {{ user.name }} {{ user.surname }}
        </h1>
        <address class="text-base text-muted not-italic max-sm:text-center">
          {{ user.email ?? translateRole(user.role) }}
        </address>
      </div>
    </div>

    <div
      class="flex flex-wrap items-center max-sm:justify-center max-sm:w-full gap-1.5">
      <slot name="links" />
    </div>
  </div>
</template>

<style scoped>
.id-developer {
  background: linear-gradient(270deg, #fb2c36 0%, #e12afb 100%);
}

.id-regular {
  background: var(--color-info);
}
</style>
