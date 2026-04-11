<script setup lang="ts">
definePageMeta({
  layout: "content",
});

defineRouteRules({
  prerender: true,
});

const { data } = await useAsyncData("about", () =>
  queryCollection("about").first(),
);
</script>

<template>
  <UPage class="pb-16">
    <UPageHero>
      <template #headline>
        <UBadge variant="subtle" :icon="data!.hero.headlineIcon" size="lg">
          {{ data!.hero.headline }}</UBadge
        >
      </template>
      <template #title>
        Inteligentná <br />
        <span class="text-primary">debatná</span> platforma
      </template>
      <AboutGraphics :icons="data!.hero.icons" />
    </UPageHero>
    <UPageSection v-bind="data!.platform" orientation="horizontal">
      <NuxtImg
        :src="data!.platform.image"
        :alt="data!.platform.alt"
        class="rounded-lg object-cover w-full h-64" />
    </UPageSection>
    <UContainer>
      <UPageGrid>
        <UPageCard title="Plne open source" icon="ph:hand-heart-bold" />
        <UPageCard title="Lepší ako konkurencia" icon="ph:crown-cross-bold" />
        <UPageCard
          title="Väčší ako kedykoľvek predtým"
          icon="ph:trend-up-bold" />
      </UPageGrid>
    </UContainer>
  </UPage>
</template>

<style scoped></style>
