<template>
  <div
    class="grid grid-cols-[1fr_1.25rem] gap-2 w-full p-5 bg-yellow font-bold border-t-2 border-black z-20 items-center relative">
    <hr
      class="loader h-[3px] bg-red border-0 absolute top-0 left-0 rounded-br-[2px]" />
    <p class="mt-1">{{ props.warning }}</p>
    <Icon name="dn:warning-f" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  warning: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.loader {
  width: 100%;
  animation: load 5s linear forwards;
}

@keyframes load {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}
</style>
