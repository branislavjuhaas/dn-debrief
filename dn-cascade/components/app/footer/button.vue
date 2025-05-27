<script setup lang="ts">
const props = defineProps({
  link: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "click"): void;
}>();

/**
 * This function handles the click event for the button.
 * It emits a click event if the button is not disabled.
 * @param event - The click event.
 */
const handle = (event: MouseEvent) => {
  emit("click");
};
</script>

<template>
  <button v-if="!props.link" class="button" @click="handle">
    <span>
      <slot />
    </span>
  </button>
  <nuxt-link v-else :to="props.link" class="button">
    <span>
      <slot />
    </span>
  </nuxt-link>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.button {
  @apply flex min-w-40 px-5 h-10 border-2 border-black rounded-2xl items-center justify-center hover:bg-red hover:!text-white;
}

.button > span {
  @apply mt-1;
}
</style>
