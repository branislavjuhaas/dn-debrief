<script setup lang="ts">
useSeoMeta({
  title: "Platba dokončená",
  description: "Váš pokus o platbu sa podarilo úspešne zrealizovať.",
});
</script>

<template>
  <UPage>
    <UPageBody>
      <FormBase
        icon="i-ph-seal-check"
        title="Platba úspešne dokončená"
        description="Váš pokus o platbu sa podarilo úspešne zrealizovať. Ďakujeme, že využívate služby SDA.">
        <USeparator />
        <UButton to="/" color="primary" block>
          Návrat na domovskú stránku
        </UButton>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
