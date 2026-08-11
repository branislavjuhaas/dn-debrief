<script setup lang="ts">
import { motion } from "motion-v";

defineProps<{
  icons: string[];
}>();

const shifts = useState("about-graphics-shifts", () =>
  Array.from({ length: 16 }, () => Math.random()),
);
</script>

<template>
  <div
    class="flex md:grid gap-2 lg:gap-4 items-center justify-center grid-cols-10 w-fit mx-auto mt-10">
    <motion.div
      v-for="(icon, i) in icons"
      :key="i"
      :initial="{
        opacity: 0,
        x: (3.5 - (i % 8)) * Math.abs(3.5 - (i % 8)) * -25,
      }"
      :transition="{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }"
      :animate="{ opacity: 1, x: 0 }"
      class="p-4 rounded-lg bg-default ring ring-default w-16 h-16 hidden md:block">
      <UIcon
        :name="icon"
        size="2rem"
        mode="svg"
        class="text-neutral"
        :style="{
          opacity:
            0.5 - Math.abs(3.5 - (i % 8)) / 12 + (shifts[i] ?? 0.5) * 0.4,
        }" />
    </motion.div>
    <motion.div
      :initial="{
        opacity: 0,
        color: 'var(--ui-text-muted)',
        boxShadow:
          '0 0 0 0 color-mix(in oklab, var(--ui-primary) 10%, transparent)',
      }"
      :animate="{
        opacity: [0, 1, 1],
        color: [
          'var(--ui-text-muted)',
          'var(--ui-text-muted)',
          'var(--ui-primary)',
        ],
        boxShadow: [
          '0 0 0 0 color-mix(in oklab, var(--ui-primary) 10%, transparent)',
          '0 0 0 0 color-mix(in oklab, var(--ui-primary) 10%, transparent)',
          '0 0 300px 300px color-mix(in oklab, var(--ui-primary) 10%, transparent)',
        ],
      }"
      :transition="{ duration: 1.4, times: [0, 0.4, 1] }"
      class="flex items-center justify-center rounded-lg outline outline-current min-w-34 min-h-34 w-full h-full -z-10 col-span-2 row-span-2 row-start-1 col-start-5">
      <UIcon name="i-ph-brain" size="4rem" />
    </motion.div>
  </div>
</template>

<style scoped></style>
