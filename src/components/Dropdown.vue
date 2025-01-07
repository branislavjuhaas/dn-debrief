<script setup>
// Import necessary functions from Vue
import { ref, watch, computed } from "vue";

// Define the props that this component accepts
const props = defineProps({
  name: String,
  label: String,
  options: {
    type: Array,
    required: true,
  },
  disabled: Boolean,
  modelValue: [String, Number],
});

// Define a ref to control the dropdown expansion
const expand = ref(false);

// Define a ref to hold the current value of the dropdown
const value = ref(props.modelValue);

// Computed property to get the display text
const selectedText = computed(() => {
  const selectedOption = props.options.find(option => option.value === value.value);
  return selectedOption ? selectedOption.text : '';
});

// Computed property to filter out hidden options
const visibleOptions = computed(() => {
  return props.options.filter(option => !option.hidden);
});

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

// Watch for changes in the modelValue prop
watch(
  () => props.modelValue,
  () => {
    // Update the value ref with the new modelValue
    value.value = props.modelValue;
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
    <!-- Display the selected text instead of value -->
    <p class="truncate" :class="props.disabled ? 'text-grey' : ''">
      {{ selectedText }}
    </p>
    <img
      src="./../assets/icons/down.svg"
      alt="expand"
      class="cursor-pointer w-5" />
    <div
      v-if="expand"
      class="flex flex-col max-h-96 overflow-y-auto scrollbar-hidden absolute bg-white border-2 border-black text-black rounded-[1.25rem] top-12 left-0 w-full z-10">
      <!-- Iterate over visibleOptions instead of all options -->
      <p
        v-for="option in visibleOptions"
        :key="option.value"
        @click="value = option.value"
        class="flex px-5 h-12 items-center cursor-pointer hover:text-red">
        {{ option.text }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
