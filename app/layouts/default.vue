<script setup lang="ts"></script>

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
