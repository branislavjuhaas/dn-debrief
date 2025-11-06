<script setup lang="ts">
import type { FooterColumn } from "@nuxt/ui";

const source = "https://github.com/branislavjuhaas/dn-cascade";

const footerLinks: FooterColumn[] = [
  {
    label: "Podpora",
    children: [
      {
        label: "Podmienky používania",
        to: "/terms-of-service",
      },
      {
        label: "Vyhlásenie GDPR",
        to: "/privacy-policy",
      },
      {
        label: "Používateľský manuál",
        to: "/docs/introduction",
      },
    ],
  },
  {
    label: "Užitočné odkazy",
    children: [
      {
        label: "Fastballot",
        to: "https://fastballot.sk/",
        target: "_blank",
      },
      {
        label: "Slovenská debatná asociácia",
        to: "https://sda.sk/",
        target: "_blank",
      },
    ],
  },
  {
    label: "O projekte",
    children: [
      {
        label: "O projekte DNC",
        to: "/about",
      },
      {
        label: "Zdrojový kód",
        to: source,
        target: "_blank",
      },
    ],
  },
];
</script>

<template>
  <USeparator />
  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns :columns="footerLinks">
          <template #right>
            <p class="text-muted text-sm">
              Platforma DN Cascade vzniká ako súčasť modernizácie a
              digitalizácie pôsobnosti Slovenskej debatnej asociácie.
            </p>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>
    <template #left>
      <p class="text-muted text-sm">
        2024 - 2025&nbsp;&nbsp;|&nbsp;&nbsp;Branislav Juhás & TpVSÚPDNC SDA
      </p>
    </template>
    <template #right>
      <UButton
        icon="ph:github-logo"
        color="neutral"
        variant="ghost"
        :to="source"
        target="_blank"
        aria-label="GitHub" />
    </template>
  </UFooter>
</template>

<style scoped></style>
