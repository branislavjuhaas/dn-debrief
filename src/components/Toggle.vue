<script setup>
import { ref, watch } from "vue";
import square from "../assets/icons/square.svg";
import squareChecked from "../assets/icons/square-checked.svg";

const props = defineProps(["checked", "label", "modelValue"]);

const checked = ref(props.checked);

const emit = defineEmits(["update:modelValue"]);

watch(
  () => checked.value,
  () => {
    emit("update:modelValue", checked.value);
  },
);
</script>

<template>
  <div
    @click="checked = !checked"
    class="grid grid-cols-[auto_1fr] items-center h-12 px-4 gap-2 border-2 border-black border-dashed rounded-[1.25rem] cursor-pointer hover:border-solid">
    <img :src="checked ? squareChecked : square" class="cursor-pointer w-5" />
    <p class="text-black font-bold mt-1">{{ props.label }}</p>
  </div>
</template>

<style scoped></style>
