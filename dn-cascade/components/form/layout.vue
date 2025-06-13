<template>
  <app-wrapper class="grid grid-cols-2">
    <div
      class="flex flex-col min-h-full items-center justify-between gap-16 p-5">
      <slot />
    </div>
    <div
      class="bg-[url('/images/dn-banner.png')] bg-center bg-no-repeat w-full h-full flex items-center justify-center">
      <img src="@/assets/images/form/dn-logo.svg" alt="DN" />
    </div>
  </app-wrapper>
</template>

<script setup lang="ts"></script>

<style scoped></style>
