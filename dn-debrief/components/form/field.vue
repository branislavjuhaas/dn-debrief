<template>
  <div class="w-full">
    <label v-if="props.label" :for="id" class="text-sm font-medium text-black">
      {{ props.label }}
    </label>
    <div class="relative w-full mt-1">
      <input
        :id="id"
        v-model="localValue"
        :class="
          input({
            size: props.size,
            disabled: props.disabled,
            left: props.left,
            right: props.right,
          })
        "
        :type="inputType"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :aria-disabled="props.disabled"
        :aria-label="props.label || props.placeholder" >
      <button
        v-if="props.type === 'password'"
        type="button"
        :disabled="props.disabled"
        class="absolute right-0 top-0 h-full w-fit px-5 flex items-center text-black disabled:text-gray cursor-pointer"
        :aria-pressed="isPasswordVisible"
        :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
        @click="togglePasswordVisibility">
        <Icon :name="isPasswordVisible ? 'ph:eye-slash' : 'ph:eye'" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { tv } from "tailwind-variants";
import { ref, computed, watch, useId } from "vue";

const props = defineProps<{
  modelValue?: string | number;
  label?: string;
  size?: "default" | "dialog";
  type?: "text" | "number" | "password" | "email" | "tel" | "url";
  placeholder?: string;
  disabled?: boolean;
  left?: boolean;
  right?: boolean;
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

const isPasswordVisible = ref(false);

const inputType = computed(() => {
  if (props.type === "password") {
    return isPasswordVisible.value ? "text" : "password";
  }
  return props.type;
});

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const input = tv({
  base: "relative flex items-center bg-white justify-between w-full px-5 border-2 border-black text-black transition-colors duration-200 ease-in-out placeholder:text-gray focus:border-red",
  variants: {
    size: {
      default: "text-base pt-2.5 pb-1.5 rounded-2xl",
      dialog: "text-base pt-1.5 pb-0.5 rounded-lg",
    },
    disabled: {
      true: "text-gray cursor-not-allowed",
      false: "",
    },
    left: {
      true: "rounded-l-0 border-l-0 pl-0",
    },
    right: {
      true: "rounded-r-0 border-r-0 pr-0",
    },
  },
  defaultVariants: {
    size: "default",
    disabled: false,
  },
});
</script>

<style scoped></style>
