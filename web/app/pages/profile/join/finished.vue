<script setup lang="ts">
const route = useRoute();
const pending = route.query.pending === "true";
const verified = route.query.verified === "true";
const paid = route.query.paid === "true";
const error = route.query.error === "true";

const getTitle = () => {
  if (error) return "Chyba pri registrácii";
  if (pending) return "Čakáme na potvrdenie";
  if (verified) return "Registrácia úspešne potvrdená";
  if (paid) return "Registrácia úspešne zaplatená";
  return "Registrácia úspešná";
};

const getDescription = () => {
  if (error)
    return "Pri potvrdení registrácie došlo k chybe. Prosím, skúste to znova.";
  if (pending)
    return "Na email vášho zákonného zástupcu bol odoslaný odkaz na potvrdenie registrácie.";
  if (verified)
    return "Okrem bytia súčasťou niečoho väčšieho má vaše dieťa možnosť účastniť sa všetkých podujatí SDA a využívať všetky ostatné výhody členstva.";
  return "Okrem bytia súčasťou niečoho väčšieho máte možnosť účastniť sa všetkých podujatí SDA a využívať všetky ostatné výhody členstva.";
};

const getIcon = () => {
  if (error) return "i-ph-warning-octagon";
  if (pending) return "i-ph-hourglass-medium";
  if (verified) return "i-ph-checks";
  if (paid) return "i-ph-hand-coins";
  return "i-ph-cheers";
};

useSeoMeta({
  title: getTitle(),
  description: getDescription(),
});

const { data: userFetch } = await useFetch("/api/users/me", {
  key: "users-me",
  enabled: !verified,
});

const { data: paymentData } = await useFetch(
  `/api/payments/${route.query.pay as NonEmptyString}`,
  {
    key: `payments-${route.query.pay}`,
    enabled: !!route.query.pay,
  },
);

const { data: userData } = useNuxtData<typeof userFetch.value>("users-me");

const paying = ref(false);

const pay = async () => {
  if (!paymentData.value?.payment) return;
  paying.value = true;
  try {
    const response = await $fetch("/api/payments/checkout", {
      method: "POST",
      body: {
        paymentIds: [paymentData.value.payment.id],
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
</script>

<template>
  <UPage>
    <UPageBody>
      <FormBase
        :icon="getIcon()"
        :title="
          !pending && !verified && !error
            ? `${paid ? 'Platba úspešná' : 'Vitajte v SDA'}, ${userData?.user?.name}!`
            : getTitle()
        "
        :description="getDescription()">
        <USeparator />
        <UAlert
          v-if="paymentData?.payment"
          color="info"
          icon="i-ph-info"
          variant="subtle"
          title="Požadovaná platba členského poplatku">
          <template #description>
            Pre úspešné dokončenie registrácie je potrebné uhradiť členský
            poplatok vo výške <b>{{ paymentData.payment.amount / 100 }}€</b>.
          </template>
        </UAlert>
        <div class="flex flex-row items-stretch gap-4">
          <template v-if="verified || pending || route.query.pay">
            <UButton
              v-if="paymentData?.payment"
              @click="pay"
              color="primary"
              :loading="paying"
              block>
              Prejsť k platbe {{ paymentData.payment.amount / 100 }}€
            </UButton>
            <UButton v-else to="/" block> Návrat na domovskú stránku </UButton>
          </template>
          <template v-else-if="error">
            <UButton
              to="mailto:juhas@sda.sk"
              color="neutral"
              variant="subtle"
              block>
              Kontaktovať podporu
            </UButton>
            <UButton to="/" block> Návrat na domovskú stránku </UButton>
          </template>
          <template v-else>
            <UButton to="/" color="neutral" variant="subtle" block>
              Návrat na domovskú stránku
            </UButton>
            <UButton to="/events" block> Navštíviť podujatia </UButton>
          </template>
        </div>
      </FormBase>
    </UPageBody>
  </UPage>
</template>
