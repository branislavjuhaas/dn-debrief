<template>
  <label
    class="flex flex-row gap-4 items-center [&>.checkbox]:hover:bg-neutral-100">
    <CheckboxRoot
      v-model:checked="localValue"
      class="flex shrink-0 h-4 w-4 appearance-none items-center justify-center rounded border border-black outline-none focus-within:shadow-[0_0_0_2px_black]">
      <CheckboxIndicator
        class="bg-black rounded-[2px] text-white h-full w-full flex items-center justify-center">
        <Icon name="ph:check" class="h-3 w-3" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <span v-if="label" class="select-none text-black leading-[110%] mt-1">
      {{ label }}
    </span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean;
  label?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});
</script>

<style scoped></style>
