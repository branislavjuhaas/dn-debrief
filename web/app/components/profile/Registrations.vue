<script setup lang="ts">
import type { RegistrationRole } from "#shared/types/event";
import { isPlatformRegistration } from "#shared/utils/events";
import type { TableColumn } from "@nuxt/ui";

const props = defineProps<{
  userId: string;
}>();

const { data, status, refresh } = await useFetch<{
  registrations: any[];
}>(`/api/users/${props.userId}/registrations`, {
  key: `user-registrations-${props.userId}`,
});

const registrations = computed(() => data.value?.registrations ?? []);

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const NuxtLink = resolveComponent("NuxtLink");

const getRoleName = (reg: any): string => {
  const cfg = reg.event?.registrationConfig;
  if (isPlatformRegistration(cfg) && reg.registrationData?.roleUuid) {
    const role = cfg.roles.find(
      (r: RegistrationRole) => r.uuid === reg.registrationData.roleUuid,
    );
    if (role) return role.name;
  }
  return "Účastník";
};

const formatDateRange = (beginning?: string, end?: string) => {
  if (!beginning) return "—";
  const b = new Date(beginning);
  const dateOpts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };
  const bStr = b.toLocaleDateString("sk-SK", dateOpts);
  if (!end) return bStr;
  const e = new Date(end);
  const eStr = e.toLocaleDateString("sk-SK", dateOpts);
  return bStr === eStr ? bStr : `${bStr} – ${eStr}`;
};

const columns: TableColumn<any>[] = [
  {
    accessorKey: "event",
    header: "Podujatie",
    cell: ({ row }) => {
      const reg = row.original;
      const ev = reg.event;
      if (!ev) return "Neznáme podujatie";

      return h("div", { class: "flex flex-col gap-0.5" }, [
        h(
          NuxtLink,
          {
            to: `/events/${ev.slug}`,
            class: "font-semibold text-primary hover:underline",
          },
          () => ev.name,
        ),
        h("div", { class: "flex items-center gap-2 text-xs text-muted" }, [
          ev.place ? h("span", null, ev.place) : null,
          ev.place ? h("span", null, "•") : null,
          h("span", null, formatDateRange(ev.beginning, ev.end)),
        ]),
      ]);
    },
  },
  {
    accessorKey: "role",
    header: "Rola",
    cell: ({ row }) => {
      const roleName = getRoleName(row.original);
      return h(
        UBadge,
        { color: "info", variant: "subtle", size: "sm" },
        () => roleName,
      );
    },
  },
  {
    accessorKey: "team",
    header: "Tím",
    cell: ({ row }) => {
      const team = row.original.registrationData?.teamName;
      if (!team) {
        return h("span", { class: "text-muted text-xs" }, "—");
      }
      return h("span", { class: "font-medium text-highlighted text-xs" }, team);
    },
  },
  {
    accessorKey: "payment",
    header: "Stav platby",
    cell: ({ row }) => {
      const reg = row.original;
      if (reg.payment) {
        if (reg.payment.status === "paid") {
          return h(
            UBadge,
            { color: "success", variant: "subtle", size: "sm" },
            () => `Uhradené (${reg.payment.amount / 100} €)`,
          );
        }
        return h(
          UBadge,
          { color: "warning", variant: "subtle", size: "sm" },
          () => `Čaká na úhradu (${reg.payment.amount / 100} €)`,
        );
      }
      return h(
        UBadge,
        { color: "neutral", variant: "subtle", size: "sm" },
        () => "Bez poplatku",
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Dátum registrácie",
    cell: ({ row }) => {
      const d = row.original.createdAt;
      return d
        ? new Date(d).toLocaleDateString("sk-SK", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
        : "—";
    },
  },
  {
    id: "actions",
    header: "Akcie",
    cell: ({ row }) => {
      const reg = row.original;
      const slug = reg.event?.slug;
      if (!slug) return null;

      return h("div", { class: "flex items-center gap-1.5" }, [
        reg.payment && reg.payment.status !== "paid"
          ? h(UButton, {
              to: `/events/${slug}/finished?pay=${reg.payment.id}`,
              size: "xs",
              color: "primary",
              label: "Zaplatiť",
              icon: "i-ph-credit-card",
            })
          : null,
        h(UButton, {
          to: `/events/${slug}`,
          size: "xs",
          color: "neutral",
          variant: "subtle",
          label: "Detail",
          icon: "i-ph-arrow-square-out",
        }),
      ]);
    },
  },
];
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="status === 'pending'"
      class="flex items-center justify-center py-12">
      <UIcon name="i-ph-spinner" class="size-6 animate-spin text-muted" />
    </div>

    <div
      v-else-if="registrations.length === 0"
      class="text-center py-8 text-sm text-muted">
      Zatiaľ nie sú zaznamenané žiadne registrácie na podujatia.
    </div>

    <UTable v-else :data="registrations" :columns="columns" />
  </div>
</template>
