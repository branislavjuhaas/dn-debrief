<script setup lang="ts">
type ProgressCircleProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  textSize?: string;
  textColor?: string;
};

const props = withDefaults(defineProps<ProgressCircleProps>(), {
  size: 50,
  strokeWidth: 5,
  showLabel: true,
});

const textSizeStyle = computed(() => {
  if (!props.textSize) return undefined;
  return { fontSize: props.textSize };
});

const getProgressColor = (value: number): string => {
  if (value >= 75) return "stroke-emerald-500 dark:stroke-emerald-400";
  if (value > 50) return "stroke-amber-500 dark:stroke-amber-400";
  return "stroke-rose-500 dark:stroke-rose-400";
};

const actualSize = computed(() => props.size);
const actualStrokeWidth = computed(() => props.strokeWidth);
const radius = computed(() => actualSize.value / 2 - actualStrokeWidth.value);
const circumference = computed(() => 2 * Math.PI * radius.value);
const strokeDasharray = computed(
  () => `${(props.value / 100) * circumference.value} ${circumference.value}`,
);
const center = computed(() => actualSize.value / 2);
</script>

<template>
  <div
    class="relative"
    :style="{ width: `${actualSize}px`, height: `${actualSize}px` }">
    <svg class="h-full w-full" :viewBox="`0 0 ${actualSize} ${actualSize}`">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="currentColor"
        :stroke-width="actualStrokeWidth"
        class="text-(--ui-bg-accented)" />

      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="currentColor"
        :stroke-width="actualStrokeWidth"
        :class="getProgressColor(value)"
        stroke-linecap="round"
        :stroke-dasharray="strokeDasharray"
        :transform="`rotate(-90 ${center} ${center})`"
        class="transition-all duration-500 ease-out" />
      <text
        :x="center"
        :y="center"
        text-anchor="middle"
        dominant-baseline="central"
        class="font-bold"
        :class="[
          textColor ?? 'fill-gray-700 dark:fill-gray-200',
          { 'text-xs': !textSize },
        ]"
        :style="textSizeStyle">
        {{ value }}%
      </text>
    </svg>
  </div>
</template>
