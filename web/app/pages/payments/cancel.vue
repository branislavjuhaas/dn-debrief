<script setup lang="ts">
useSeoMeta({
  title: "Platba neúspešná",
  description: "Pokus o platbu sa nepodarilo úspešne zrealizovať.",
});
</script>

<template>
  <UPage>
    <UPageBody>
      <FormBase
        icon="i-ph-seal-warning"
        title="Platba neúspešná"
        description="Váš pokus o platbu sa nepodarilo úspešne zrealizovať. Skúste to, prosím, znova zo sekcie platby na stránke profilu alebo kontaktujte administrátora/-ku.">
        <USeparator />
        <UButton to="/profile#payments" color="primary" block>
          Prejsť na stránku profilu
        </UButton>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
