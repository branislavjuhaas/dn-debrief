<script setup lang="ts">
import { differenceInYears } from "date-fns";

defineProps<{
  user: User;
}>();
</script>

<template>
  <div class="flex flex-col space-y-3">
    <ProfileDetail
      icon="i-ph-shield-star-fill"
      label="Používateľská rola"
      :value="translateRole(user.role)" />
    <ProfileDetail
      icon="i-ph-cake-fill"
      label="Dátum narodenia"
      type="date"
      :value="user.birthDate" />
    <ProfileDetail
      icon="i-ph-phone-disconnect-fill"
      label="Telefónne číslo"
      type="phone"
      :value="user.phone" />
    <ProfileDetail
      icon="i-ph-buildings-fill"
      label="Adresa trvalého pobytu"
      :value="`${user.street}, ${user.postalCode} ${user.town}`" />
    <ProfileDetail
      v-if="
        Math.abs(differenceInYears(user.birthDate ?? new Date(), new Date())) <
        18
      "
      icon="i-ph-baby-fill"
      label="Zákonný/-á zástupca/-kyňa"
      :value="`${user.legalGuardian?.name} · ${user.legalGuardian?.email}`" />
    <ProfileDetail
      v-if="user.credential > 0"
      icon="i-ph-seal-warning-fill"
      label="Rozhodcovská akreditácia"
      :value="`${user.credential}. stupeň`" />
  </div>
</template>
