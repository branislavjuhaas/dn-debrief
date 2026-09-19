<script setup lang="ts">
import { CalendarDate, parseDate, Time } from "@internationalized/date";
import type { TabsItem } from "@nuxt/ui";
import { ref, watch } from "vue";
import type z from "zod";

type Schedule = z.infer<typeof scheduleSchema>;

const model = defineModel<Schedule>({ default: () => ({ days: [] }) });

const formatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "short",
});

const createSchedule = (schedule: Schedule): string => {
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

const parseSlovakTime = (timeStr: string): Time => {
  const parts = timeStr.split(":").map((p) => p.trim());
  if (parts.length < 2 || parts.length > 3) {
    throw new Error("Neplatný formát času");
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
    throw new Error("Neplatný formát času");
  }

  return new Time(hour, minute, second);
};

const parseSlovakDate = (dateStr: string): CalendarDate => {
  const parts = dateStr
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length !== 3) {
    throw new Error("Neplatný formát dátumu");
  }

  const day = parseInt(parts[0] ?? "", 10);
  const month = parseInt(parts[1] ?? "", 10);
  const year = parseInt(parts[2] ?? "", 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error("Neplatný formát dátumu");
  }

  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  const isoStr = `${year}-${paddedMonth}-${paddedDay}`;

  return parseDate(isoStr);
};

const parseSchedule = (scheduleText: string): Schedule => {
  const lines = scheduleText.split("\n");
  const parsedSchedule: Schedule = { days: [] };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("#")) {
      const dateStr = line.slice(1).trim();
      let calendarDate: CalendarDate;

      try {
        calendarDate = parseSlovakDate(dateStr);
      } catch {
        throw new Error(`Neplatný formát dátumu: "${dateStr}"`);
      }

      parsedSchedule.days.push({
        date: calendarDate.toString(),
        schedule: [],
      });
    } else if (line.startsWith("-")) {
      if (parsedSchedule.days.length === 0) {
        throw new Error(`Časový rozsah je definovaný pred dátumom: "${line}"`);
      }

      const [timeRange, description] = line.slice(1).split("=");
      if (!timeRange || description === undefined) {
        throw new Error(
          `Riadok musí obsahovať '=' na oddelenie popisu: "${line}"`,
        );
      }

      const trimmedDescription = description.trim();
      if (!trimmedDescription) {
        throw new Error(`Chýba popis pre časový rozsah: "${line}"`);
      }

      const [startTimeStr, endTimeStr] = timeRange.split("-");
      if (!startTimeStr || !endTimeStr) {
        throw new Error(`Neplatný formát časového rozsahu: "${line}"`);
      }

      let startTime: Time, endTime: Time;
      try {
        startTime = parseSlovakTime(startTimeStr.trim());
        endTime = parseSlovakTime(endTimeStr.trim());
      } catch {
        throw new Error(`Neplatný čas v rozsahu: "${line}"`);
      }

      if (
        startTime.hour > endTime.hour ||
        (startTime.hour === endTime.hour && startTime.minute >= endTime.minute)
      ) {
        throw new Error(
          `Začiatok časového rozsahu musí byť pred koncom: "${line}"`,
        );
      }

      const currentDay = parsedSchedule.days[parsedSchedule.days.length - 1];
      currentDay?.schedule.push({
        beginning: startTime.hour * 60 + startTime.minute,
        duration:
          (endTime.hour - startTime.hour) * 60 +
          (endTime.minute - startTime.minute),
        text: trimmedDescription,
      });
    }
  }

  return parsedSchedule;
};

// Component State
const scheduleText = ref(createSchedule(model.value));
const parsingError = ref<string | null>(null);

// Watch text input: updates model when valid or captures error when invalid
watch(
  scheduleText,
  (newText) => {
    if (!newText.trim()) {
      parsingError.value = null;
      model.value = { days: [] };
      return;
    }

    try {
      const parsed = parseSchedule(newText);
      parsingError.value = null;
      model.value = parsed;
    } catch (err) {
      parsingError.value =
        err instanceof Error ? err.message : "Neplatný formát";
    }
  },
  { immediate: true },
);

// Watch external model changes: syncs text editor when parent changes model directly
watch(
  () => model.value,
  (newModel) => {
    if (!newModel) return;

    try {
      // Prevent cursor jumps/loop cycles if the text already parses to the incoming model
      const currentParsed = parseSchedule(scheduleText.value);
      if (JSON.stringify(currentParsed) === JSON.stringify(newModel)) {
        return;
      }
    } catch {
      // If local text currently has syntax errors, allow external model to override
    }

    scheduleText.value = createSchedule(newModel);
  },
  { deep: true },
);

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
        v-model="scheduleText"
        class="font-mono w-full"
        :rows="10"
        autoresize
        placeholder="# 23.1.2027&#10;- 14:00 - 14:15 = Otvorenie podujatia" />
    </template>

    <template #preview>
      <EventSchedule :schedule="model ?? { days: [] }" />
    </template>
  </UTabs>
</template>
