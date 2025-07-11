<template>
  <NumberFieldRoot
    :id="id"
    v-model="localValue"
    class="w-full"
    :disabled="props.disabled"
    :default-value="0"
    :min="props.min"
    :max="props.max"
    :step="props.step">
    <div :class="inputWrapper({ size: props.size, disabled: props.disabled })">
      <NumberFieldDecrement
        class="p-2 h-full w-fit px-5 flex items-center text-black disabled:text-gray cursor-pointer">
        <Icon name="ph:minus" />
      </NumberFieldDecrement>
      <NumberFieldInput
        class="bg-transparent w-full tabular-nums text-center focus:outline-0 p-1" />
      <NumberFieldIncrement
        class="p-2 h-full w-fit px-5 flex items-center text-black disabled:text-gray cursor-pointer">
        <Icon name="ph:plus" />
      </NumberFieldIncrement>
    </div>
  </NumberFieldRoot>
</template>

<script setup lang="ts">
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from "reka-ui";
import { tv } from "tailwind-variants";
import { ref, watch, useId } from "vue";

const props = defineProps<{
  modelValue?: number;
  size?: "default" | "dialog";
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}>();

const emit = defineEmits(["update:modelValue"]);

const id = useId();

const localValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localValue.value) {
      localValue.value = newValue;
    }
  }
);

watch(localValue, (newValue) => {
  emit("update:modelValue", newValue);
});

const inputWrapper = tv({
  base: "relative mt-1 flex items-center bg-white justify-between w-full border-2 border-black text-black transition-colors duration-200 ease-in-out focus-within:border-red",
  variants: {
    size: {
      default: "h-11 rounded-2xl",
      dialog: "h-9 rounded-lg",
    },
    disabled: {
      true: "text-gray cursor-not-allowed",
      false: "",
    },
  },
  defaultVariants: {
    size: "default",
    disabled: false,
  },
});
</script>

<style scoped></style>
