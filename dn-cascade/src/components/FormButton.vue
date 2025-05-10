<script setup lang="ts">
const props = defineProps<{
  type: "primary" | "secondary";
  disabled?: boolean;
  link?: string;
}>();

const emit = defineEmits(["click"]);

/**
 * This function handles the click event for the button.
 * It emits a click event if the button is not disabled.
 * @param event - The click event.
 */
const handle = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emit("click", event);
};
</script>

<template>
  <button
    v-if="!props.link || props.disabled"
    class="button"
    :class="[props.type === 'primary' ? 'form-primary' : 'form-secondary']"
    :disabled="props.disabled"
    @click="handle">
    <span>
      <slot />
    </span>
  </button>
  <a
    v-else-if="
      props.link &&
      (props.link.startsWith('http') || props.link.startsWith('mailto:'))
    "
    :href="props.link"
    class="button"
    :class="[props.type === 'primary' ? 'form-primary' : 'form-secondary']">
    <span>
      <slot />
    </span>
  </a>
  <router-link
    v-else-if="props.link"
    :to="props.link"
    class="button"
    :class="[props.type === 'primary' ? 'form-primary' : 'form-secondary']">
    <span>
      <slot />
    </span>
  </router-link>
</template>

<style scoped>
@reference "../style.css";

.button {
  @apply flex font-bold h-12 px-5 rounded-[1.25rem] border-2 border-black duration-150 items-center justify-center;
}

.button > span {
  @apply mt-1;
}

.button:disabled {
  @apply !text-gray !border-dashed !cursor-default;
}

.form-primary {
  @apply min-w-60;
}

.form-primary:not(:disabled) {
  @apply text-white bg-red cursor-pointer hover:bg-black hover:text-white;
}

.form-secondary {
  @apply border-dashed;
}

.form-secondary:not(:disabled) {
  @apply text-black bg-white cursor-pointer hover:border-solid;
}
</style>
