<script setup>
// Import necessary functions and assets from Vue and local files
import { ref, watch } from "vue";
import eye from "../assets/icons/eye.svg";
import eyeCrossed from "../assets/icons/eye-crossed.svg";

// Define the props that this component accepts
const props = defineProps([
  "name",
  "label",
  "type",
  "readonly",
  "placeholder",
  "modelValue",
]);

// Define a ref to control the visibility of the password
const showPassword = ref(false);

// Define a ref to hold the current value of the field
const value = ref(props.modelValue);

// Define the events that this component emits
const emit = defineEmits(["update:modelValue"]);

// Function to toggle the visibility of the password
const togglePassword = (event) => {
  event.stopPropagation();
  showPassword.value = !showPassword.value;
};

// Reference to the input element
const inputRef = ref(null);

// Function to focus the input element
const focusInput = () => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
};

// Watch for changes in the value ref
watch(
  () => value.value,
  () => {
    // Emit the new value
    emit("update:modelValue", value.value);
  },
);

watch(
  () => props.modelValue, // Watch the prop directly
  (newVal) => {
    value.value = newVal; // Update the local value when prop changes
  },
);
</script>

<template>
  <div
    class="grid min-h-12 border-2 border-black rounded-[1.25rem] px-5 pt-1 gap-4"
    :class="
      props.type === 'password'
        ? 'grid-cols-[auto_1fr_auto]'
        : props.type === 'multiline'
          ? 'grid-cols-[auto_1fr]'
          : 'grid-cols-[auto_1fr] items-center'
    "
    @click="focusInput">
    <p
      class="text-black font-bold"
      :class="props.type === 'multiline' ? 'mt-2' : ''">
      {{ props.label }}
    </p>
    <!-- Conditionally render textarea for multiline type -->
    <textarea
      v-if="props.type === 'multiline'"
      ref="inputRef"
      :name="props.name"
      :readonly="props.readonly"
      class="w-full h-[calc(100%-1rem)] my-2 outline-none bg-transparent text-black placeholder-grey resize-none"
      :placeholder="props.placeholder"
      v-model="value"
      rows="3" />
    <!-- Render input for other types -->
    <input
      v-else
      :type="showPassword ? 'text' : props.type"
      :readonly="props.readonly"
      ref="inputRef"
      class="w-full outline-none bg-transparent h-auto text-black placeholder-grey"
      :placeholder="props.placeholder"
      v-model="value" />
    <img
      v-if="props.type === 'password'"
      :src="showPassword ? eyeCrossed : eye"
      @click="togglePassword"
      class="cursor-pointer w-5" />
  </div>
</template>

<style scoped></style>
