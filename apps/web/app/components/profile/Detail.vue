<script setup lang="ts">
import { parseDate } from "@internationalized/date";

const props = defineProps<{
  label: string;
  value?: string | number | null;
  type?: "default" | "date" | "phone";
  icon?: string;
}>();

const formatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
});

const formattedValue = computed(() => {
  if (!props.value) return null;
  if (props.type === "date")
    return formatter.format(
      parseDate(props.value.toString() ?? "").toDate("utc"),
    );
  if (props.type === "phone")
    return props.value
      .toString()
      ?.replace(/^(\+421)(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
  return props.value.toString();
});
</script>

<template>
  <span class="space-x-2 text-sm items-center flex">
    <UIcon :name="icon" class="size-5" />
    {{ label }}:&nbsp;
    <b v-if="formattedValue">{{ formattedValue }}</b>
    <span v-else class="text-dimmed">chýba</span>
  </span>
</template>
