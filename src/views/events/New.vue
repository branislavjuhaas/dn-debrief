<script setup>
import Thumbnail from "../../components/Thumbnail.vue";
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">Vytvoriť podujatie</h1>
    <div
      class="flex flex-col sm:grid sm:grid-cols-[auto_1fr] w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-8 transition-all">
      <div class="overflow-hidden rounded-[1.25rem] w-[26.875rem]">
        <thumbnail
          name="3. stred"
          beginning-date="10-2-2025"
          end-date="11-2-2025"
          city="Ružomberok" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
