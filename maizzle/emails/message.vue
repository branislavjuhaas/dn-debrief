<template>
  <Layout class="bg-zinc-200">
    <Font family="DM Sans" />
    <Preheader
      >Pre aktiváciu vášho účtu, potvrďte, prosím, svoj email</Preheader
    >

    <Container class="max-w-xl p-0 py-10 sm:p-6">
      <Section class="px-6 py-5 bg-zinc-50 rounded-t-lg border border-zinc-300">
        <Link href="https://debrief.sda.sk">
          <Img src="/logo.png" alt="Maizzle" class="h-5 w-18" />
        </Link>
      </Section>

      <Section class="px-6 py-6 bg-zinc-50 border-x border-zinc-300 mx-autos">
        <Row>
          <Column class="text-center">
            <Img
              src="https://api.iconify.design/ph:seal-question.svg"
              alt="Icon"
              width="64"
              height="64" />
          </Column>
        </Row>
        <Row class="text-center text-zinc-800 font-dm-sans mt-6">
          <Column>
            <Heading class="text-xl">${title}</Heading>
            <Text class="text-zinc-500 mx-10 mt-1">${text}</Text>
          </Column>
        </Row>
      </Section>
      <Section class="px-6 py-5 bg-zinc-50 rounded-b-lg border border-zinc-300">
        <Row>
          <Column>
            <Text as="span" class="text-sm text-zinc-500 font-dm-sans"
              >2024 - {{ new Date().getFullYear() }} | Branislav Juhás &
              TpVSÚPDND</Text
            >
          </Column>
          <Column class="w-5">
            <Link
              href="https://github.com/branislavjuhaas/dn-debrief"
              target="_blank">
              <Img
                src="https://api.iconify.design/ph:github-logo.svg"
                alt="Icon"
                width="20"
                class="h-5"
            /></Link>
          </Column>
        </Row>
      </Section>
    </Container>
  </Layout>
</template>
