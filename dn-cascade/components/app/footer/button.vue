<script setup lang="ts">
const props = defineProps({
  link: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "alone",
    validator: (value: string) => ["alone", "left-alone"].includes(value),
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
const handle = (_event: MouseEvent) => {
  emit("click");
};
</script>

<template>
  <button
    v-if="!props.link"
    class="button"
    :class="[
      props.type === 'left-alone' ? 'button-left-alone' : 'button-alone',
    ]"
    @click="handle">
    <span>
      <slot />
    </span>
    @click="handle">
    <span>
      <slot />
    </span>
  </button>
  <nuxt-link
    v-else
    :to="props.link"
    class="button"
    :class="[
      props.type === 'left-alone' ? 'button-left-alone' : 'button-alone',
    ]">
    <span>
      <slot />
    </span>
  </nuxt-link>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.button {
  @apply flex min-w-40 px-5 h-10 border-2 border-black items-center justify-center hover:bg-red hover:!text-white;
}

.button-left-alone {
  @apply rounded-l-2xl;
}

.button-alone {
  @apply rounded-2xl;
}

.button > span {
  @apply mt-1;
}
</style>
