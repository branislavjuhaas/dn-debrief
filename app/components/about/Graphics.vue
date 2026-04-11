<script setup lang="ts">
defineProps<{
  icons: string[];
}>();

const shifts = useState("about-graphics-shifts", () =>
  Array.from({ length: 16 }, () => Math.random()),
);
</script>

<template>
  <div class="gap-2 lg:gap-4 grid grid-cols-10 w-fit mx-auto mt-10">
    <div
      v-for="(icon, i) in icons"
      :key="i"
      class="p-4 rounded-lg bg-default ring ring-default w-16 h-16 hidden md:block">
      <UIcon
        :name="icon"
        size="2rem"
        class="text-neutral"
        :style="{
          opacity: 0.5 - Math.abs(3.5 - (i % 8)) / 12 + shifts[i] * 0.4,
        }" />
    </div>
    <div
      class="flex items-center justify-center rounded-lg ring shadow-primary/10 shadow-[0_-20px_200px_200px] min-w-34 min-h-34 -z-10 ring-primary col-span-2 row-span-2 row-start-1 col-start-5">
      <UIcon name="i-ph-brain" size="4rem" class="text-primary" />
    </div>
  </div>
</template>

<style scoped></style>
