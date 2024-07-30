<script setup>
import { ref, watch } from "vue";
import eye from "../assets/icons/eye.svg";
import eyeCrossed from "../assets/icons/eye-crossed.svg";

const props = defineProps([
  "name",
  "label",
  "type",
  "placeholder",
  "modelValue",
]);

// Reactive variable to keep track of whether the password is shown or not
const showPassword = ref(false);

const value = ref(props.modelValue);

const emit = defineEmits(["update:modelValue"]);

// Function to toggle the value of showPassword
const togglePassword = (event) => {
  event.stopPropagation();
  showPassword.value = !showPassword.value;
};

// Reference to the input element
const inputRef = ref(null);

// Function to focus the input element
const focusInput = () => {
  inputRef.value.focus();
};

// Watcher to emit the updated value to the parent component
watch(
  () => value.value,
  () => {
    emit("update:modelValue", value.value);
  },
);
</script>

<template>
  <div
    class="grid border-2 border-black h-12 rounded-[1.25rem] items-center px-5 pt-1 gap-4"
    :class="
      props.type === 'password'
        ? 'grid-cols-[auto_1fr_auto]'
        : 'grid-cols-[auto_1fr]'
    "
    @click="focusInput">
    <p class="text-black font-bold">{{ props.label }}</p>
    <input
      ref="inputRef"
      :name="props.name"
      :type="showPassword ? 'text' : props.type"
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
