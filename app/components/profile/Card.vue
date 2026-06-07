<script setup lang="ts">
import { parseDate } from "@internationalized/date";
import { differenceInYears } from "date-fns";

defineProps<{
  user: User;
}>();

const formatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium", // 'medium' outputs numeric day, month, and year
});
</script>

<template>
  <UCard>
    <div class="grid grid-cols-2 space-y-2 text-sm text-muted">
      <div>
        Email: <span class="text-default">{{ user.email }}</span>
      </div>
      <div>
        Meno a priezvisko:
        <span class="text-default">{{ user.name + " " + user.surname }}</span>
      </div>
      <div>
        Dátum narodenia:
        <span class="text-default">{{
          formatter.format(parseDate(user.birthDate ?? "").toDate("utc"))
        }}</span>
      </div>
      <div>
        Telefónne číslo:
        <span class="text-default">{{
          user.phone?.replace(/^(\+421)(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4")
        }}</span>
      </div>
      <div>
        Adresa trvalého pobytu:<br />
        <span class="text-default"
          >{{ user.street }}, {{ user.postalCode }} {{ user.town }}</span
        >
      </div>
      <div
        v-if="
          Math.abs(
            differenceInYears(user.birthDate ?? new Date(), new Date()),
          ) < 18
        ">
        Zákonný/-á zástupca/-kyňa<br />
        <span class="text-default"
          >{{ user.legalGuardian?.name }} ·
          {{ user.legalGuardian?.email }}</span
        >
      </div>
    </div>
    <template #footer>
      <span class="text-sm text-pretty text-muted font-medium">
        <slot name="footer" />
      </span>
    </template>
  </UCard>
</template>
