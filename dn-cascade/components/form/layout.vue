<template>
  <app-wrapper class="md:grid md:grid-cols-2">
    <div
      class="flex flex-col min-h-full items-center justify-between gap-16 p-5">
      <slot />
    </div>
    <div
      class="max-md:hidden w-full h-full flex items-end justify-center relative bg-[#0f2544]">
      <NuxtImg
        src="/images/form/dn-banner.png"
        alt="DN Cascade"
        preload
        width="1456"
        height="816"
        class="absolute w-auto h-auto object-none" />
      <NuxtImg
        src="/images/form/dn-logo.svg"
        alt="DN"
        preload
        width="120"
        height="136"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10" />
      <Transition name="fly-in" mode="out-in">
        <form-warning v-if="warnings.length > 0" :warning="warnings[0]" />
      </Transition>
    </div>
  </app-wrapper>
</template>

<script setup lang="ts">
const warnings = ref<string[]>([]);

const warn = (message: string): void => {
  warnings.value.push(message);
  setTimeout(() => {
    const idx = warnings.value.indexOf(message);
    if (idx !== -1) warnings.value.splice(idx, 1);
  }, 5000);
};

defineExpose({
  warn,
});
</script>

<style scoped>
.fly-in-enter-active,
.fly-in-leave-active {
  transition: all 0.3s ease;
}
.fly-in-enter-from,
.fly-in-leave-to {
  transform: translateY(100%);
}
.fly-in-enter-to,
.fly-in-leave-from {
  transform: translateY(0);
}
</style>
