<template>
  <EditableRoot
    v-slot="{ isEditing }"
    v-model="localValue"
    :placeholder="props.placeholder"
    default-value=""
    submit-mode="enter"
    auto-resize
    class="flex flex-row gap-4 w-full text-black items-center justify-between"
    @submit="onSubmit">
    <EditableArea class="w-full">
      <EditablePreview />
      <EditableInput class="w-full placeholder:text-gray" />
    </EditableArea>
    <EditableEditTrigger
      v-if="!isEditing"
      class="outline-none cursor-pointer hover:text-red">
      <Icon name="ph:pencil-simple" />
    </EditableEditTrigger>
    <div v-else class="flex gap-2">
      <EditableSubmitTrigger class="outline-none cursor-pointer hover:text-red">
        <Icon name="ph:check" />
      </EditableSubmitTrigger>
      <EditableCancelTrigger class="outline-none cursor-pointer hover:text-red">
        <Icon name="ph:x" />
      </EditableCancelTrigger>
    </div>
  </EditableRoot>
</template>

<script setup lang="ts">
import {
  EditableArea,
  EditableCancelTrigger,
  EditableEditTrigger,
  EditableInput,
  EditablePreview,
  EditableRoot,
  EditableSubmitTrigger,
} from "reka-ui";
import { ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "Zadajte text...",
  }
);

const emit = defineEmits(["update:modelValue", "submit"]);

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

const onSubmit = () => {
  emit("submit", localValue.value);
};
</script>

<style scoped></style>
