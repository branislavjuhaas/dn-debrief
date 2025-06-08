<script setup lang="ts"></script>

<template>
  <div
    class="flex flex-col bg-white min-h-[3.75rem] items-center justify-center px-5 border-t-2 border-black">
    <cookies-banner v-if="false" />
    <div
      v-else
      class="flex flex-row justify-between items-center max-w-[1320px] h-full w-full">
      <p class="hidden mt-1 sm:flex">
        2024 - 2025&nbsp;&nbsp;&nbsp;&nbsp;Branislav Juhás
      </p>

      <div class="flex flex-row gap-14 items-center w-full sm:w-auto">
        <nuxt-link to="/privacy" class="hidden mt-1 sm:flex">GDPR</nuxt-link>
        <!--          v-if="user.role && user.role !== 'user'"-->
        <nuxt-link to="/manage" class="hidden mt-1 sm:flex">
          {{ "Vývojár - Správa" }}
        </nuxt-link>
        <div class="w-full sm:w-auto flex flex-row gap-1 items-center">
          <app-footer-button link="/auth" class="w-full" type="left-alone">
            {{ "Prihlásiť sa" }}
          </app-footer-button>
          <app-footer-menu/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
