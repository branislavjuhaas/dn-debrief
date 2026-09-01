<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
  icon?: string;
}>();

const slots = defineSlots<{
  default(): any;
  title(): any;
  description(): any;
  footer(): any;
}>();
</script>

<template>
  <UPageCard
    :ui="{
      root: 'overflow-hidden',
      container: 'grid md:grid-cols-2 p-0 sm:p-0 gap-x-0',
    }">
    <div class="hidden md:block relative">
      <NuxtImg
        src="/assets/form.png"
        alt="Background image"
        width="800"
        class="object-cover absolute w-full h-full" />
    </div>
    <div class="flex flex-col gap-y-4 p-4 sm:p-6">
      <div
        v-if="
          title ||
          !!slots.title ||
          description ||
          !!slots.description ||
          !!slots.footer
        "
        class="flex flex-col text-center">
        <div v-if="icon" class="mb-2">
          <UIcon :name="icon" class="size-16 shrink-0 inline-block" />
        </div>

        <h2
          v-if="title || !!slots.title"
          class="text-xl text-pretty font-semibold text-highlighted">
          <slot name="title">{{ title }}</slot>
        </h2>

        <div
          v-if="description || !!slots.description"
          class="mt-1 text-base text-pretty text-muted mx-8">
          <slot name="description">{{ description }}</slot>
        </div>
      </div>

      <slot />

      <div
        v-if="!!slots.footer"
        class="text-sm text-pretty text-muted text-center font-medium">
        <slot name="footer" />
      </div>
    </div>
  </UPageCard>
</template>

<style scoped></style>
