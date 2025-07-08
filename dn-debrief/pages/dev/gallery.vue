<template>
  <div class="flex flex-col w-full">
    <h1 class="text-2xl font-bold mb-4">Buttons</h1>
    <div
      id="buttons"
      class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center mb-12">
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        :variant="variant as any">
        {{ variant.charAt(0).toUpperCase() + variant.slice(1) }}
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        icon="ph:nut"
        :variant="variant as any">
        {{ variant.charAt(0).toUpperCase() + variant.slice(1) }} - Icon
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        external
        :variant="variant as any">
        {{ variant.charAt(0).toUpperCase() + variant.slice(1) }} - External
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        disabled
        :variant="variant as any">
        {{ variant.charAt(0).toUpperCase() + variant.slice(1) }} - Disabled
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        size="header"
        :variant="variant as any">
        {{ variant.charAt(0).toUpperCase() + variant.slice(1) }} - Header
      </AppButton>
      <AppButton
        v-for="variant in buttonVariants"
        :key="variant"
        size="dialog"
        :variant="variant as any">
        {{ variant.charAt(0).toUpperCase() + variant.slice(1) }} - Dialog
      </AppButton>
    </div>
    <h1 class="text-2xl font-bold mb-4">Fields</h1>
    <div
      id="fields"
      class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <FormField
        v-for="size in fieldSizes"
        :key="size"
        :size="size as any"
        placeholder="Field (Text)" />
      <FormField
        v-for="size in fieldSizes"
        :key="size + '-number'"
        :size="size as any"
        type="number"
        placeholder="Field (Number)" />
      <FormField
        v-for="size in fieldSizes"
        :key="size + '-password'"
        :size="size as any"
        type="password"
        placeholder="Field (Password)" />
      <FormField
        v-for="size in fieldSizes"
        :key="size + '-email'"
        :size="size as any"
        type="email"
        placeholder="Field (Email)" />
      <FormField
        v-for="size in fieldSizes"
        :key="size + '-tel'"
        :size="size as any"
        type="tel"
        placeholder="Field (Tel)" />
    </div>
    <h1 class="text-2xl font-bold mb-4">Calendar</h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <FormCalendar
        v-model:model-value="calendarValue"
        @update:model-value="(value) => console.log('Selected date:', value)" />
      <FormCalendar size="dialog" />
    </div>
    <h1 class="text-2xl font-bold mb-4">Dropdown</h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <FormDropdown
        :options="[
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ]"
        placeholder="Select an option" />
      <FormDropdown
        :options="[
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ]"
        size="dialog"
        placeholder="Select an option" />
      <FormDropdown
        :options="[
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ]"
        label="Title"
        searchable
        placeholder="Search options" />
      <FormDropdown
        icons
        :options="[
          { label: 'Option 1', value: '1', disabled: true, icon: 'ph:nut' },
          { label: 'Option 2', value: '2', icon: 'ph:gear' },
          { label: 'Option 3', value: '3', icon: 'ph:star' },
        ]"
        size="dialog"
        searchable
        placeholder="Search options"
        @select="(value) => console.log('Selected:', value)" />
    </div>
    <h1 class="text-2xl font-bold mb-4">Wrapper</h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <FormWrapper title="Title" hint="This is a hint">
        <FormField placeholder="Wrapped Field" />
      </FormWrapper>
      <FormWrapper title="Title" size="dialog" hint="This is a hint">
        <FormField size="dialog" placeholder="Wrapped Field" />
      </FormWrapper>
    </div>
    <h1 class="text-2xl font-bold mb-4">Checkbox</h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items center mb-12">
      <FormCheckbox label="Checkbox 1" />
      <FormCheckbox
        label="This is a multiline checkbox label that should wrap to the next line if it is too long. This is a multiline checkbox label that should wrap to the." />
    </div>
    <h1 class="text-2xl font-bold mb-4">Toasts</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mb-12">
      <AppButton @click="showInfoToast">Show Info Toast</AppButton>
      <AppButton @click="showWarningToast">Show Warning Toast</AppButton>
      <AppButton @click="showActionToast">Show Action Toast</AppButton>
    </div>
    <h1 class="text-2xl font-bold mb-4">Alerts</h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
      <AppButton @click="showInfoAlert">Show Info Alert</AppButton>
      <AppButton @click="showCriticalAlert">Show Critical Alert</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const buttonVariants = ["primary", "secondary", "tertiary", "ghost"];
const fieldSizes = ["default", "dialog"];
const calendarValue = "2007-01-01";

import { useToast } from "~/composables/useToast";
import { useAlert } from "~/composables/useAlert";
const { addToast } = useToast();
const { showAlert } = useAlert();

const showInfoToast = () => {
  addToast({
    text: "Účet bol vytvorený. Pre plný prístup k funkciám Platformy DN Cascade sa staň členom SDA.",
    autoClose: false,
    action: {
      text: "Stať sa členom SDA",
      onClick: () => {
        console.log("Action clicked!");
      },
    },
  });
};

const showWarningToast = () => {
  addToast({
    title: "Warning",
    text: "This is a warning toast.",
    variant: "warning",
  });
};

const showActionToast = () => {
  addToast({
    title: "Action",
    text: "This is a toast with an action.",
    action: {
      text: "Go to gallery",
      to: "/dev/gallery",
    },
  });
};

const showInfoAlert = () => {
  showAlert({
    title: "Alert",
    content: "This is an alert, would you like to continue?",
    variant: "warning",
    continueText: "Continue",
    onContinue: () => {
      alert("Alert continued!");
    },
    cancelText: "Cancel",
    onCancel: () => {
      alert("Alert cancelled!");
    },
  });
};

const showCriticalAlert = () => {
  showAlert({
    title: "Critical Alert",
    content: "This is a critical alert, would you like to continue?",
    variant: "critical",
    continueText: "Continue",
    cancelText: "Cancel",
    onContinue: () => {
      alert("Critical alert continued!");
    },
    onCancel: () => {
      alert("Critical alert cancelled!");
    },
  });
};
</script>

<style scoped></style>
