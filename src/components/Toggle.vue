<script setup>
// Import necessary modules and functions
import { ref, watch } from "vue";
import square from "../assets/icons/square.svg";
import squareChecked from "../assets/icons/square-checked.svg";

// Define component props
const props = defineProps([
  "checked",
  "label",
  "secondary",
  "modelValue",
  "readonly",
]);

// Create a reactive reference for the checked state
const checked = ref(props.modelValue);

// Define the event that this component emits
const emit = defineEmits(["update:modelValue"]);

// Watch for changes in the checked state and emit an event when it changes
watch(
  () => props.modelValue,
  (newValue) => {
    checked.value = newValue;
  },
);

watch(
  () => checked.value,
  () => {
    emit("update:modelValue", checked.value);
  },
);
</script>

<template>
  <div
    @click="!props.readonly && (checked = !checked)"
    class="grid grid-cols-[auto_1fr] items-center h-12 px-4 gap-2 border-2 border-black border-dashed rounded-[1.25rem] cursor-pointer hover:border-solid">
    <img :src="checked ? squareChecked : square" class="cursor-pointer w-5" />
    <p class="text-black mt-1 truncate">
      <span class="font-bold">{{ props.label }}</span>
      {{ props.secondary ? `(${props.secondary})` : "" }}
    </p>
  </div>
</template>

<style scoped></style>
