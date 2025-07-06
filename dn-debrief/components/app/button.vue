<template>
  <component
    :is="props.to && !props.disabled ? NuxtLink : 'button'"
    :to="props.to"
    :class="
      button({
        variant: props.variant || 'primary',
        size: props.size || 'default',
        disabled: props.disabled,
      })
    "
    :disabled="props.disabled"
    @click="handleClick"
  >
    <Icon v-if="props.icon" :name="props.icon" />
    <span class="mt-1">
      <slot>
        {{ props.title }}
      </slot>
    </span>
    <Icon v-if="props.external" name="ph:arrow-square-up-right" />
  </component>
</template>

<script setup lang="ts">
import { tv } from "tailwind-variants";

const NuxtLink = resolveComponent("NuxtLink");

const props = defineProps<{
  title?: string;
  icon?: string;
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  size?: "default" | "dialog" | "header";
  disabled?: boolean;
  external?: boolean;
  to?: string;
}>();

const emit = defineEmits(["click"]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit("click", event);
  }
};

const button = tv({
  base: "flex flex-row items-center justify-center gap-2 rounded-2xl px-5 border-2 border-black cursor-pointer transition-colors duration-200 ease-in-out",
  variants: {
    variant: {
      primary: "bg-red text-white font-bold hover:bg-black",
      secondary: "text-black font-bold hover:bg-red hover:text-white",
      tertiary: "text-black bg-transparent border-dashed hover:border-solid",
      ghost:
        "bg-transparent text-black border-0 hover:text-dark-blue p-0! h-fit!",
    },
    size: {
      default: "h-11 py-3",
      dialog: "h-9 py-2 rounded-lg",
      header: "h-10 py-2.5",
    },
    disabled: {
      true: "bg-transparent text-gray cursor-not-allowed hover:bg-transparent hover:text-gray",
    },
  },
  compoundVariants: [
    {
      variant: "primary",
      size: "default",
      class: "min-w-50",
    },
    {
      variant: "tertiary",
      disabled: true,
      class: "hover:border-dashed",
    },
  ],
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});
</script>

<style scoped></style>
