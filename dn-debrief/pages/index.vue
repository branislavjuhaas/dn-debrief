<template>
  <div>
    <h1>Welcome to DebRIEF v2</h1>
    <AppButton
      variant="primary"
      @click="() => console.log('Primary Button Clicked')">
      Primary
    </AppButton>
    <AppButton variant="secondary" to="/auth">Secondary</AppButton>
    <AppButton variant="tertiary" icon="ph:nut">Tertiary</AppButton>
    <AppButton variant="ghost" external>Ghost</AppButton>
    <AppButton variant="primary">With Icon</AppButton>
    <AppButton variant="tertiary" icon="ph:nut" size="dialog">
      Dialog Size
    </AppButton>
    <AppButton variant="primary" size="header">Header Size</AppButton>
    <!--Disabled button variants-->
    <AppButton variant="primary" disabled>Disabled Primary</AppButton>
    <AppButton variant="secondary" disabled>Disabled Secondary</AppButton>
    <AppButton variant="tertiary" disabled>Disabled Tertiary</AppButton>
    <AppButton variant="ghost" disabled>Disabled Ghost</AppButton>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Home",
  meta: [
    { name: "description", content: "DebRIEF v2 - A modern web application" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});
</script>

<style scoped></style>
