<script setup lang="ts">
import { parseDate } from "@internationalized/date";
import { differenceInYears } from "date-fns";

defineProps<{
  user: User;
}>();

const formatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
});
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
      :value="
        formatter.format(parseDate(user.birthDate ?? '').toDate('utc'))
      " />
    <ProfileDetail
      icon="i-ph-phone-disconnect-fill"
      label="Telefónne číslo"
      :value="
        user.phone?.replace(/^(\+421)(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4')
      " />
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
