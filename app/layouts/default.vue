<script setup lang="ts">
import AppHeader from "~/components/header/AppHeader.vue";
import AppFooter from "~/components/footer/AppFooter.vue";
</script>

<template>
  <div>
    <AppHeader />
    <UMain>
      <UPage>
        <UContainer>
          <slot />
        </UContainer>
      </UPage>
    </UMain>
    <AppFooter />
  </div>
</template>

<style scoped></style>
