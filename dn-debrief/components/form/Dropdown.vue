<template>
  <ComboboxRoot
    v-if="props.searchable"
    v-model="searchTerm"
    v-model:open="isOpen"
    class="relative">
    <ComboboxAnchor
      :class="dropdown({ size: props.size, disabled: props.disabled })"
      @click="isOpen = true">
      <ComboboxInput
        class="w-full bg-transparent outline-none mt-0.5"
        :placeholder="props.placeholder || 'Vyberte možnosť'" />
      <ComboboxTrigger class="cursor-pointer">
        <Icon name="ph:caret-down" class="text-black" />
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxContent
      :body-lock="false"
      :collision-padding="{ bottom: 60, top: 60 }"
      :class="dropdownContent({ size: props.size })">
      <ComboboxViewport>
        <ComboboxEmpty class="px-2 py-1 text-gray">
          Nenašla sa žiadna zhoda.
        </ComboboxEmpty>
        <ComboboxItem
          v-for="option in props.options"
          :key="option.value"
          :value="option.label"
          :disabled="option.disabled"
          class="text-black hover:text-red focus:text-dark-blue focus:outline-0 rounded-lg px-2 py-1 cursor-pointer data-[disabled]:text-gray data-[disabled]:cursor-not-allowed data-[disabled]:hover:text-gray"
          @select="updateModelValue(option.value)">
          <div class="flex items-center gap-2">
            <Icon v-if="props.icons" :name="option.icon || 'ph:question'" />
            <span class="mt-1">{{ option.label }}</span>
          </div>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
  <SelectRoot
    v-else
    :disabled="props.disabled"
    :model-value="props.modelValue"
    @update:model-value="updateModelValue">
    <SelectTrigger
      class="cursor-pointer"
      :class="dropdown({ size: props.size, disabled: props.disabled })">
      <SelectValue
        class="mt-1"
        :placeholder="props.placeholder || 'Vyberte možnosť'" />
      <Icon name="ph:caret-down" class="text-black" />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        :body-lock="false"
        :class="dropdownContent({ size: props.size })">
        <SelectViewport>
          <SelectItem
            v-for="option in props.options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            class="text-black hover:text-red focus:text-dark-blue focus:outline-0 rounded-lg px-2 py-1 cursor-pointer data-[disabled]:text-gray data-[disabled]:cursor-not-allowed data-[disabled]:hover:text-gray">
            <SelectItemText class="flex items-center gap-2">
              <Icon v-if="props.icons" :name="option.icon || 'ph:question'" />
              <span class="mt-1">{{ option.label }}</span>
            </SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<script setup lang="ts">
import { tv } from "tailwind-variants";

type Option = {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options?: Array<Option>;
    searchable?: boolean;
    disabled?: boolean;
    icons?: boolean;
    size?: "default" | "dialog";
    placeholder?: string;
  }>(),
  {
    options: () => [],
    modelValue: "",
    size: "default",
    placeholder: "",
  }
);

const isOpen = ref(false);

/**
 * @emits update:modelValue (value: string) - Emitted when the selected value changes.
 * @emits select (value: string) - Emitted when an option is selected.
 */
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "select", value: string): void;
}>();

// Ref the search term corresponding to selected model value
const searchTerm = ref(
  props.options.find((option) => option.value === props.modelValue)?.label || ""
);

watch(
  () => props.modelValue,
  (newValue) => {
    searchTerm.value =
      props.options.find((option) => option.value === newValue)?.label || "";
  }
);

const updateModelValue = (value: string) => {
  if (!value) return;
  emit("update:modelValue", value);
  emit("select", value);
};

const dropdown = tv({
  base: "relative flex flex-row w-full items-center justify-between px-5 gap-2 bg-white cursor-pointer text-black border-2 border-black transition-colors duration-200 ease-in-out focus-within:border-red data-[placeholder]:text-gray",
  variants: {
    size: {
      default: "h-11 rounded-2xl",
      dialog: "h-9 rounded-lg",
    },
    disabled: {
      true: "cursor-not-allowed",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const dropdownContent = tv({
  base: "absolute w-full px-3 py-2 shadow-dialog bg-white border-2 border-black will-change-[opacity,transform] z-[110]",
  variants: {
    size: {
      default: "rounded-2xl",
      dialog: "rounded-lg",
    },
  },
  defaultVariants: {
    size: "default",
  },
});
</script>

<style scoped></style>
