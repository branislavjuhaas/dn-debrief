<script setup lang="ts">
import {
  getDayOfWeek,
  parseAbsolute,
  parseDate,
} from "@internationalized/date";
import type z from "zod";

type Schedule = z.infer<typeof scheduleSchema>;

const props = defineProps<{
  schedule?: Schedule;
}>();

const days = [
  "Pondelok",
  "Utorok",
  "Streda",
  "Štvrtok",
  "Piatok",
  "Sobota",
  "Nedeľa",
];

const formatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "short",
});
</script>

<template>
  <div v-for="(day, index) in schedule?.days" :key="index" class="mb-6">
    <h3 class="font-bold mb-2">
      {{ days[getDayOfWeek(parseDate(day.date), "sk-SK")] }}
      <span class="text-dimmed ml-1">
        {{ formatter.format(new Date(day.date)) }}
      </span>
    </h3>

    <table class="w-full border-collapse text-sm">
      <caption class="sr-only">
        Harmonogram na
        {{
          days[getDayOfWeek(parseDate(day.date), "sk-SK")]
        }}
        {{
          formatter.format(new Date(day.date))
        }}
      </caption>
      <thead class="sr-only">
        <tr>
          <th scope="col">Čas začiatku</th>
          <th scope="col">Čas konca</th>
          <th scope="col">Popis programu</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, itemIndex) in day.schedule" :key="itemIndex">
          <td class="font-bold whitespace-nowrap align-top">
            <time
              :datetime="`${String(Math.floor(item.beginning / 60)).padStart(2, '0')}:${String(item.beginning % 60).padStart(2, '0')}`">
              {{ Math.floor(item.beginning / 60) }}:{{
                String(item.beginning % 60).padStart(2, "0")
              }}
            </time>
          </td>

          <td class="font-bold whitespace-nowrap align-top">
            <span aria-hidden="true">&nbsp;-&nbsp;</span>
            <time
              :datetime="`${String(Math.floor((item.beginning + item.duration) / 60)).padStart(2, '0')}:${String((item.beginning + item.duration) % 60).padStart(2, '0')}`">
              {{ Math.floor((item.beginning + item.duration) / 60) }}:{{
                String((item.beginning + item.duration) % 60).padStart(2, "0")
              }}
            </time>
          </td>

          <td class="pl-3 align-top w-full">
            {{ item.text }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
