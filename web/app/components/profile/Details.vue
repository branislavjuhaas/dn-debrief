<script setup lang="ts">
import { differenceInYears } from "date-fns";

defineProps<{
  user: User & { isMember?: boolean };
  displayAll?: boolean;
  hideMissing?: boolean;
  hideCredential?: boolean;
}>();
</script>

<template>
  <div class="flex flex-col space-y-3">
    <ProfileDetail
      icon="i-ph-shield-star-fill"
      label="Používateľská rola"
      :value="translateRole(user.role)" />
    <ProfileDetail
      :hide-if-missing="hideMissing"
      icon="i-ph-cake-fill"
      label="Dátum narodenia"
      type="date"
      :value="user.birthDate" />
    <ProfileDetail
      :hide-if-missing="hideMissing"
      icon="i-ph-phone-disconnect-fill"
      label="Telefónne číslo"
      type="phone"
      :value="user.phone" />
    <ProfileDetail
      :hide-if-missing="hideMissing"
      icon="i-ph-buildings-fill"
      label="Adresa trvalého pobytu"
      :value="
        user.street && user.postalCode && user.town
          ? `${user.street}, ${user.postalCode} ${user.town}`
          : null
      " />
    <ProfileDetail
      :hide-if-missing="hideMissing"
      v-if="
        Math.abs(differenceInYears(user.birthDate ?? new Date(), new Date())) <
        18
      "
      icon="i-ph-baby-fill"
      label="Zákonný/-á zástupca/-kyňa"
      :value="
        user.legalGuardian
          ? `${user.legalGuardian.name} · ${user.legalGuardian.email}`
          : null
      " />
    <ProfileDetail
      v-if="user.credential > 0 && !hideCredential"
      icon="i-ph-seal-warning-fill"
      label="Rozhodcovská akreditácia"
      :value="`${user.credential}. stupeň`" />
    <ProfileDetail
      v-if="displayAll"
      icon="i-ph-graduation-cap-fill"
      label="Člen/-ka SDA"
      :value="user.isMember ? 'Áno' : 'Nie'" />
    <slot name="extra" />
  </div>
</template>
