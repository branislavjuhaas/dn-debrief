<script setup>
// Import necessary functions from Vue
import { ref, watch } from "vue";

// Define the props that this component accepts
const props = defineProps([
  "name",
  "label",
  "options",
  "disabled",
  "modelValue",
]);

// Define a ref to control the dropdown expansion
const expand = ref(false);

// Define a ref to hold the current value of the dropdown
const value = ref(props.modelValue);

// Define the events that this component emits
const emit = defineEmits(["update:modelValue"]);

// Watch for changes in the value ref
watch(
  () => value.value,
  () => {
    // If the dropdown is not disabled, emit the new value
    if (!props.disabled) {
      emit("update:modelValue", value.value);
    }
  },
);
</script>

<template>
  <div
    class="grid grid-cols-[auto_1fr_auto] text-black relative border-2 border-black h-12 rounded-[1.25rem] items-center px-5 pt-1 gap-4"
    :class="props.disabled ? 'border-dashed' : 'cursor-pointer'"
    @click="!props.disabled && (expand = !expand)">
    <p class="font-bold" :class="props.disabled ? 'text-grey' : ''">
      {{ props.label }}
    </p>
    <p :class="props.disabled ? 'text-grey' : ''">{{ value }}</p>
    <img
      src="./../assets/icons/down.svg"
      alt="expand"
      class="cursor-pointer w-5" />
    <div
      v-if="expand"
      class="flex flex-col max-h-96 overflow-y-auto scrollbar-hidden absolute bg-white border-2 border-black text-black rounded-[1.25rem] top-12 left-0 w-full z-10">
      <p
        v-for="option in props.options"
        :key="option"
        @click="value = option"
        class="flex px-5 h-12 items-center cursor-pointer hover:text-red">
        {{ option }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
