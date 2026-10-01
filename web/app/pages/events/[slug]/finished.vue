<script setup lang="ts">
import type { Event } from "#shared/types/event";

const route = useRoute();
const slug = route.params.slug as string;
const toast = useToast();

const payParam = (route.query.pay as string) || "";
const paid = route.query.paid === "true";
const error = route.query.error === "true";
const confirmed = route.query.confirmed === "true";
const under18 = route.query.under18 === "true";

// Fetch event details
const { data: eventData } = await useFetch<{ event: Event }>(
  `/api/events/${slug}`,
  {
    key: `event-finished-${slug}`,
  },
);
const event = computed(() => eventData.value?.event);

// Fetch payment details if pay query param exists
const { data: paymentData } = await useFetch<{
  payment: {
    id: string;
    amount: number;
    description: string;
    status: string;
  };
}>(`/api/payments/${payParam}`, {
  key: `payment-detail-${payParam}`,
  enabled: Boolean(payParam),
});

const payment = computed(() => paymentData.value?.payment);

const getTitle = () => {
  if (error) return "Chyba pri registrácii";
  if (confirmed) return "Registrácia potvrdená zákonným zástupcom!";
  if (paid || payment.value?.status === "paid") {
    return "Platba úspešná!";
  }
  if (under18) {
    return "Registrácia zaznamenaná – čaká na potvrdenie";
  }
  if (payment.value) {
    return "Registrácia úspešne zaznamenaná";
  }
  return "Registrácia úspešne dokončená!";
};

const getDescription = () => {
  if (error) {
    return "Pri spracovaní vašej registrácie došlo k neočakávanej chybe. Prosím, skúste to znova.";
  }
  if (confirmed) {
    return `Účasť na podujatí ${event.value?.name || ""} bola úspešne overená a potvrdená.`;
  }
  if (paid || payment.value?.status === "paid") {
    return `Ďakujeme za vašu úhradu. Tešíme sa na vás na podujatí ${event.value?.name || ""}.`;
  }
  if (under18) {
    return `Vaša registrácia na podujatie ${event.value?.name || ""} bola zaznamenaná. Pre účastníkov do 18 rokov je potrebné potvrdenie zákonným zástupcom.`;
  }
  if (payment.value) {
    return `Vaša registrácia na podujatie ${event.value?.name || ""} bola zaznamenaná v systéme.`;
  }
  return `Vaša registrácia na podujatie ${event.value?.name || ""} bola úspešne zaznamenaná v systéme.`;
};

const getIcon = () => {
  if (error) return "i-ph-warning-octagon";
  if (confirmed || paid || payment.value?.status === "paid")
    return "i-ph-check-circle";
  if (under18) return "i-ph-clock";
  if (payment.value) return "i-ph-confetti";
  return "i-ph-confetti";
};

useSeoMeta({
  title: getTitle(),
  description: getDescription(),
});

const paying = ref(false);

const pay = async () => {
  if (!payment.value) return;
  paying.value = true;
  try {
    const response = await $fetch<{ url: string }>("/api/payments/checkout", {
      method: "POST",
      body: {
        paymentIds: [payment.value.id],
      },
    });

    if (response?.url) {
      await navigateTo(response.url, { external: true });
      return;
    }
  } catch (err: any) {
    toast.add({
      title: "Chyba pri platbe",
      description:
        err.data?.message ||
        "Nepodarilo sa presmerovať na platobnú bránu. Kontaktujte, prosím, organizátorov.",
      color: "error",
      icon: "i-ph-warning-octagon",
    });
    paying.value = false;
  }
};
</script>

<template>
  <UPage>
    <UPageBody>
      <FormBase
        :icon="getIcon()"
        :title="getTitle()"
        :description="getDescription()">
        <USeparator />

        <!-- Under 18 notice -->
        <UAlert
          v-if="under18 && !confirmed"
          color="warning"
          icon="i-ph-hourglass"
          variant="subtle"
          title="Potvrdenie zákonným zástupcom"
          description="Na dokončenie registrácie je potrebný súhlas zákonného zástupcu. Na jeho e-mailovú adresu bola zaslaná správa s odkazom na potvrdenie účasti." />

        <!-- Confirmed notice -->
        <UAlert
          v-else-if="confirmed"
          color="success"
          icon="i-ph-check-circle"
          variant="subtle"
          title="Účasť potvrdená"
          description="Súhlas zákonného zástupcu bol zaznamenaný a účasť je platná." />

        <!-- Payment Alert if pending payment (matching SDA membership pattern) -->
        <UAlert
          v-if="payment && payment.status !== 'paid' && !paid"
          color="info"
          icon="i-ph-info"
          variant="subtle"
          title="Požadovaná platba registračného poplatku">
          <!-- TODO: Enable payments -->
          <!-- <template #description>
            Pre úspešné dokončenie registrácie je potrebné uhradiť poplatok vo výške <b>{{ payment.amount / 100 }} €</b>.
          </template> -->
          <template #description>
            Za registráciu vám bol účtovaný poplatok vo výške
            <b>{{ payment.amount / 100 }} €</b>. O možnosti jeho úhrady vás
            budeme informovať po spustení platobnej brány.
          </template>
        </UAlert>

        <!-- Paid confirmation alert -->
        <UAlert
          v-else-if="paid || payment?.status === 'paid'"
          color="success"
          icon="i-ph-check-circle"
          variant="subtle"
          title="Poplatok bol úspešne uhradený"
          description="Vaša účasť je definitívne potvrdená. Podrobnosti a harmonogram nájdete na stránke podujatia." />

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row items-stretch gap-3 mt-4">
          <template v-if="payment && payment.status !== 'paid' && !paid">
            <!-- TODO: Enable payments -->
            <UButton
              v-if="false"
              color="primary"
              :loading="paying"
              icon="i-ph-credit-card"
              block
              @click="pay">
              Zaplatiť teraz {{ (payment?.amount || 0) / 100 }} €
            </UButton>
            <UButton
              :to="`/events/${slug}`"
              color="primary"
              variant="solid"
              block>
              Prejsť na podujatie
            </UButton>
            <UButton to="/" color="neutral" variant="subtle" block>
              Návrat na domovskú stránku
            </UButton>
          </template>

          <template v-else-if="error">
            <UButton :to="`/events/${slug}/register`" color="primary" block>
              Skúsiť znova
            </UButton>
            <UButton
              :to="`/events/${slug}`"
              color="neutral"
              variant="subtle"
              block>
              Späť na podujatie
            </UButton>
          </template>

          <template v-else>
            <UButton
              :to="`/events/${slug}`"
              color="primary"
              icon="i-ph-arrow-square-out"
              block>
              Zobraziť podujatie
            </UButton>
            <UButton to="/" color="neutral" variant="subtle" block>
              Návrat na domovskú stránku
            </UButton>
          </template>
        </div>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
