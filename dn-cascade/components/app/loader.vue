<script lang="ts" setup>
const { isLoading } = useLoadingIndicator({ duration: 1500 });
const loading = computed(() => isLoading.value);
</script>

<template>
  <div v-if="loading" class="fixed top-[3.75rem] left-0 w-full h-[4px]">
    <div class="h-full absolute bg-red rounded-b-[4px] animate-load" />
  </div>
</template>

<style scoped>
@keyframes load {
  0% {
    left: -20%;
    width: 10%;
  }
  57% {
    width: 50%;
  }
  100% {
    left: 100%;
    width: 10%;
  }
}

.animate-load {
  animation: load 1.5s infinite ease-in-out;
}
</style>
