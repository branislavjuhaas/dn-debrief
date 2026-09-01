<script setup lang="ts">
import type { AlertProps, TableColumn, TabsItem, TimelineItem } from "@nuxt/ui";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const mdAndLarger = breakpoints.greaterOrEqual("md");

definePageMeta({
  middleware: ["auth"],
});

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
});

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

useSeoMeta({
  title:
    `${userData.value?.user?.name ?? ""} ${userData.value?.user?.surname ?? ""}`.trim(),
  description: "Profil aktuálne prihláseného/-ej používateľa/-ky",
});

const authClient = useAuthClient();

const { data: sessionData } = await useAuthSession();

const logout = async () => {
  await navigateTo("/");
  await authClient.signOut();
  await clearNuxtData("users-me");
};

const stopImpersonatingUser = async () => {
  await authClient.admin.stopImpersonating();
  await navigateTo("/");
  await refreshNuxtData();
};

const tabItems = ref<TabsItem[]>([
  {
    label: "Osobné údaje",
    slot: "details",
  },
  {
    label: "Členstvá v SDA",
    slot: "memberships",
  },
  {
    label: "Registrácie na podujatia",
    disabled: true,
  },
  {
    label: "Platby",
    slot: "payments",
  },
]);

const memberships = computed<TimelineItem[]>(() => {
  return (userData.value?.user?.clubMemberships ?? [])
    .sort((a, b) => (b.season ?? 0) - (a.season ?? 0))
    ?.map((m) => ({
      date: m.season.toString(),
      title: m.club?.name,
      icon: m.confirmed
        ? "i-ph-seal-check-bold"
        : new Date().getFullYear() > m.season
          ? "i-ph-seal-bold"
          : "i-ph-seal-question-bold",
      avatar: {
        class: m.confirmed
          ? "text-inverted! bg-success!"
          : new Date().getFullYear() > m.season
            ? "text-muted!"
            : "text-inverted! bg-warning!",
      },
    }));
});

const { data: seasonsData } = await useFetch("/api/settings/seasons", {
  key: "filtered-seasons",
});

const alert = computed<AlertProps | null>(() => {
  if (!userData.value?.user?.name || !userData.value?.user?.surname) {
    return {
      title: "Chýbajúce údaje",
      description:
        "Váš profil momentálne nie je kompletný. Prosím, doplňte chýbajúce údaje.",
      icon: "i-ph-detective",
      color: "warning",
      actions: [
        {
          label: "Doplniť profil",
          to: "/profile/edit",
          size: "md",
          icon: "i-ph-list-checks",
          color: "warning",
        },
      ],
    };
  }
  if (seasonsData.value?.seasons && seasonsData.value.seasons?.length > 0) {
    return {
      title: `Registrácia na ${(seasonsData.value.seasons?.length || 0) > 1 ? "roky" : "rok"} ${seasonsData.value.seasons?.join(", ")} otvorená`,
      description:
        "Nenechajte si ujsť žiadnu z výhod plného členstvo v SDA a zaregistrujte sa ešte dnes!",
      icon: "i-ph-megaphone",
      color: "primary",
      actions: [
        {
          label: "Zaregistrovať sa",
          to: "/profile/join",
          size: "md",
          icon: "i-ph-shield-check",
          color: "primary",
        },
      ],
    };
  }
  return null;
});

const membershipsAlert = computed<AlertProps>(() => {
  // check if there is a value with season equal to current year
  const currentMembership = userData.value?.user?.clubMemberships?.find(
    (m) => m.season === new Date().getFullYear(),
  );
  if (!currentMembership) {
    return {
      title: `Chýba registrácia na rok ${new Date().getFullYear()}`,
      icon: "i-ph-seal-warning",
      color: "error",
      actions: [
        {
          label: "Zaregistrovať sa",
          to: "/profile/join",
          size: "md",
          icon: "i-ph-shield-check",
          color: "neutral",
        },
      ],
    };
  }
  if (!currentMembership.confirmed) {
    return {
      title: `Registrácia na rok ${new Date().getFullYear()} nie je potvrdená`,
      icon: "i-ph-seal-warning",
      color: "warning",
    };
  }
  return {
    title: "Vaša registrácia do SDA je kompletná!",
    icon: "i-ph-seal-check",
    color: "success",
  };
});

const debt = computed(() => {
  return userData.value?.user?.payments?.reduce((acc, payment) => {
    if (!["paid", "forgiven", "processing"].includes(payment.status)) {
      return acc + payment.amount;
    }
    return acc;
  }, 0);
});

const paying = ref(false);

const payDebt = async () => {
  const unpaidPayments = userData.value?.user?.payments?.filter(
    (payment) => !["paid", "forgiven", "processing"].includes(payment.status),
  );
  if (!unpaidPayments || unpaidPayments.length === 0) return;
  paying.value = true;
  try {
    const response = await $fetch("/api/payments/checkout", {
      method: "POST",
      body: {
        paymentIds: unpaidPayments.map((p) => p.id),
      },
    });

    if (response?.url) {
      await navigateTo(response.url, {
        external: true,
      });
      return;
    }
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: "Chyba pri platbe",
      description:
        "Nepodarilo sa presmerovať na platobnú bránu. kontaktujte, prosím, administrátora/-ku.",
      color: "error",
    });
    paying.value = false;
  }
};

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const currencyFormatter = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
  timeStyle: "short",
});

const paymentColumns: TableColumn<Payment>[] = [
  {
    accessorKey: "description",
    header: "Popis",
  },
  {
    accessorKey: "amount",
    header: "Suma",
    cell: ({ row }) => currencyFormatter.format(row.original.amount / 100),
  },
  {
    accessorKey: "status",
    header: "Stav platby",
    cell: ({ row }) => {
      const colorMap: Record<
        Payment["status"],
        "warning" | "success" | "info" | "error" | "neutral"
      > = {
        pending: "warning",
        processing: "warning",
        paid: "success",
        forgiven: "info",
        cancelled: "error",
        failed: "error",
      };

      const color = colorMap[row.original.status] ?? "neutral";

      return h(UBadge, { variant: "subtle", color }, () =>
        translatePaymentStatus(row.original.status),
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Vytvorená",
    cell: ({ row }) => {
      const date = row.original.createdAt
        ? new Date(row.original.createdAt)
        : null;
      return date && !isNaN(date.getTime()) ? dateFormatter.format(date) : "—";
    },
  },
  {
    accessorKey: "paidAt",
    header: "Zaplatená",
    cell: ({ row }) => {
      const date = row.original.paidAt ? new Date(row.original.paidAt) : null;
      return date && !isNaN(date.getTime()) ? dateFormatter.format(date) : "—";
    },
  },
];
</script>

<template>
  <UPage>
    <ProfileHeader :user="userData?.user!">
      <template #links>
        <UButton
          to="/profile/edit"
          icon="i-ph-magic-wand"
          color="neutral"
          variant="subtle">
          Upraviť profil
        </UButton>
        <UButton
          v-if="
            userData?.user?.accounts?.some((a) => a.providerId === 'credential')
          "
          to="/profile/edit#change-password"
          icon="i-ph-password"
          color="neutral"
          variant="subtle">
          Zmeniť heslo
        </UButton>
        <UButton
          v-if="sessionData?.data?.session.impersonatedBy"
          icon="i-ph-visor"
          color="info"
          @click="stopImpersonatingUser">
          Ukončiť zosobnenie
        </UButton>
        <UButton v-else icon="i-ph-plugs" color="error" @click="logout">
          Odhlásiť sa
        </UButton>
      </template>
    </ProfileHeader>
    <UPageBody>
      <UTabs
        :items="tabItems"
        variant="link"
        color="neutral"
        :ui="{
          content: 'mt-4 overflow-x-auto scrollbar-none',
        }">
        <template #details>
          <UAlert
            v-if="alert"
            variant="subtle"
            orientation="horizontal"
            v-bind="alert"
            class="mb-4" />
          <div
            class="flex flex-col lg:flex-row lg:justify-between gap-4 items-center sm:items-start">
            <ProfileDetails :user="userData?.user!" class="pl-6 w-full" />
            <ProfileAwards :user-awards="userData?.user?.awards ?? []" />
          </div>
        </template>
        <template #memberships>
          <UAlert
            v-bind="membershipsAlert"
            orientation="horizontal"
            class="mb-4" />
          <UTimeline
            :items="memberships"
            :orientation="mdAndLarger ? 'horizontal' : 'vertical'"
            :ui="{
              item: 'flex-1 max-w-46 w-full',
            }"
            class="px-6 md:px-4" />
        </template>
        <template #payments>
          <UAlert
            v-if="debt && debt > 0"
            color="error"
            icon="i-ph-warning"
            variant="subtle"
            title="Neuhradené platby"
            orientation="horizontal"
            :actions="[
              {
                label: 'Zaplatiť teraz',
                size: 'md',
                variant: 'solid',
                color: 'error',
                trailingIcon: 'i-ph-credit-card',
                loading: paying,
                onClick: payDebt,
              },
            ]"
            class="mb-4">
            <template #description>
              Momentálne máte nezaplatené platby vo výške
              <b>{{ currencyFormatter.format(debt / 100) }}</b
              >. Prosím, uhradiť ich čo najskôr.
            </template>
          </UAlert>
          <UTable
            :columns="paymentColumns"
            :data="userData?.user?.payments ?? []" />
        </template>
      </UTabs>
    </UPageBody>
  </UPage>
</template>
