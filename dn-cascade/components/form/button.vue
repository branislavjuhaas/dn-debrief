<script setup lang="ts">
const props = defineProps({
  type: {
    type: String,
    default: "primary",
    validator: (value: string) => ["primary", "secondary"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
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
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emit("click");
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
  <nuxt-link
    v-else
    :to="props.link"
    class="button"
    :class="[props.type === 'primary' ? 'form-primary' : 'form-secondary']">
    <span>
      <slot />
    </span>
  </nuxt-link>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.button {
  @apply flex font-bold px-5 py-1.5 rounded-2xl border-2 border-black duration-150 items-center justify-center;
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
