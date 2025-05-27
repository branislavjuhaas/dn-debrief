<template>
  <div class="flex flex-col h-dvh w-full">
    <app-header class="fixed w-full top-0 z-50" />
    <main class="flex-1 pt-[3.75rem] pb-[3.75rem]">
      <nuxt-layout>
        <nuxt-page />
      </nuxt-layout>
    </main>
    <app-footer class="fixed bottom-0 w-full z-50" />
  </div>
</template>

<script setup lang="ts"></script>
