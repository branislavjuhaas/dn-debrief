<script setup lang="ts">
import { CalendarDate, parseDate, Time } from "@internationalized/date";
import type { TabsItem } from "@nuxt/ui";
import type z from "zod";

type Schedule = z.infer<typeof scheduleSchema>;

const model = defineModel<Schedule>();

const formatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "short",
});

const createSchedule = (schedule: Schedule) => {
  let scheduleStr = "";
  for (const day of schedule.days) {
    const dayDate = parseDate(day.date);
    scheduleStr += `# ${formatter.format(dayDate.toDate("utc"))}\n`;
    for (const item of day.schedule) {
      const startHour = Math.floor(item.beginning / 60);
      const startMinute = item.beginning % 60;
      const endHour = Math.floor((item.beginning + item.duration) / 60);
      const endMinute = (item.beginning + item.duration) % 60;
      scheduleStr += `- ${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")} - ${String(
        endHour,
      ).padStart(
        2,
        "0",
      )}:${String(endMinute).padStart(2, "0")} = ${item.text}\n`;
    }
  }
  return scheduleStr.trim();
};

const schedule = ref(createSchedule(model.value ?? { days: [] }));

const parseSlovakTime = (timeStr: string): Time => {
  const parts = timeStr.split(":").map((p) => p.trim());
  if (parts.length < 2 || parts.length > 3) {
    throw new Error("Neplatný formát");
  }

  const hour = parseInt(parts[0] ?? "0", 10);
  const minute = parseInt(parts[1] ?? "0", 10);
  const second = parts[2] !== undefined ? parseInt(parts[2] ?? "0", 10) : 0;

  if (
    isNaN(hour) ||
    isNaN(minute) ||
    isNaN(second) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    throw new Error("Neplatný formát");
  }

  return new Time(hour, minute, second);
};

const parseSlovakDate = (dateStr: string): CalendarDate => {
  const parts = dateStr
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length !== 3) {
    throw new Error("Neplatný formát");
  }

  const day = parseInt(parts[0] ?? "", 10);
  const month = parseInt(parts[1] ?? "", 10);
  const year = parseInt(parts[2] ?? "", 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error("Neplatný formát");
  }

  // Pad month and day to YYYY-MM-DD ISO format
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  const isoStr = `${year}-${paddedMonth}-${paddedDay}`;

  // parseDate performs full calendar range-validation and throws on invalid dates
  return parseDate(isoStr);
};

const parseSchedule = (schedule: string) => {
  const lines = schedule.split("\n");
  let parsedSchedule: Schedule = { days: [] };

  for (const line of lines) {
    if (line.startsWith("#")) {
      const dateStr = line.slice(1).trim();

      // Parse Slovak date format into a CalendarDate instance
      let calendarDate: CalendarDate;
      try {
        calendarDate = parseSlovakDate(dateStr);
      } catch {
        throw new Error(`Neplatný formát dátumu: ${dateStr}`);
      }

      // Convert to strict ISO string YYYY-MM-DD for <EventSchedule>
      const isoDateStr = calendarDate.toString();

      parsedSchedule.days.push({
        date: isoDateStr, // Now passes "2026-01-23" instead of "23.1.2026"
        schedule: [],
      });
    }

    if (line.startsWith("-")) {
      const [timeRange, description] = line.slice(1).split("=");
      if (!timeRange) {
        throw new Error(`Chýba časový rozsah pre popis: ${line}`);
      }

      if (!description) {
        throw new Error(`Chýba popis pre časový rozsah: ${line}`);
      }

      const [startTimeStr, endTimeStr] = timeRange.split("-");
      if (!startTimeStr || !endTimeStr) {
        throw new Error(`Neplatný formát časového rozsahu: ${line}`);
      }

      let startTime: Time, endTime: Time;
      try {
        startTime = parseSlovakTime(startTimeStr.trim());
        endTime = parseSlovakTime(endTimeStr.trim());
      } catch {
        throw new Error(`Neplatný formát časového rozsahu: ${line}`);
      }

      if (
        startTime.hour > endTime.hour ||
        (startTime.hour === endTime.hour && startTime.minute >= endTime.minute)
      ) {
        throw new Error(
          `Začiatok časového rozsahu musí byť pred koncom: ${line}`,
        );
      }

      if (parsedSchedule.days.length === 0) {
        throw new Error(`Časový rozsah je definovaný pred dátumom: ${line}`);
      }

      const currentDay = parsedSchedule.days[parsedSchedule.days.length - 1];
      if (!currentDay) {
        throw new Error(`Časový rozsah je definovaný pred dátumom: ${line}`);
      }

      currentDay.schedule.push({
        beginning: startTime.hour * 60 + startTime.minute,
        duration:
          (endTime.hour - startTime.hour) * 60 +
          (endTime.minute - startTime.minute),
        text: description.trim(),
      });
    }
  }

  return parsedSchedule;
};

const parsingError = ref<string | null>(null);

const items = [
  {
    label: "Editor",
    icon: "i-ph-pencil-ruler",
    slot: "editor" as const,
  },
  {
    label: "Ukážka",
    icon: "i-ph-blueprint",
    slot: "preview" as const,
  },
] satisfies TabsItem[];
</script>

<template>
  <!-- unmount-on-hide prevents background component watcher crashes -->
  <UTabs :items="items" variant="link" :unmount-on-hide="true">
    <template #editor>
      <UAlert
        v-if="parsingError"
        :title="parsingError"
        color="error"
        variant="subtle"
        icon="i-ph-textbox"
        class="mb-4" />
      <UTextarea
        class="font-mono w-full"
        v-model="schedule"
        :rows="10"
        autoresize />
    </template>
    <template #preview>
      <!-- Safe fallback object if model is undefined -->
      <EventSchedule :schedule="model ?? { days: [] }" />
    </template>
  </UTabs>
</template>
