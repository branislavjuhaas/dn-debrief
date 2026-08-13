<script lang="ts" setup>
import { CalendarDate, parseDate } from "@internationalized/date";
import type { FormSubmitEvent } from "@nuxt/ui";
import z from "zod";

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits(["close"]);

const schema = z.object({
  firstName: z.string("Meno je povinný údaj").nonempty("Meno je povinný údaj"),
  lastName: z
    .string("Priezvisko je povinný údaj")
    .nonempty("Priezvisko je povinný údaj"),
  birthDate: z
    .any()
    .refine(
      (value) => value instanceof CalendarDate,
      "Dátum narodenia je povinný údaj",
    ),
  street: z
    .string("Ulica trvalého pobytu je povinný údaj")
    .nonempty("Ulica trvalého pobytu je povinný údaj"),
  postalCode: z
    .string("PSČ trvalého pobytu je povinný údaj")
    .nonempty("PSČ trvalého pobytu je povinný údaj")
    .regex(/^\d{5}$/, "PSČ musí byť vo formáte 00000"),
  town: z
    .string("Obec trvalého pobytu je povinný údaj")
    .nonempty("Obec trvalého pobytu je povinný údaj"),
  phone: z.e164("Neplatné telefónne číslo"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  firstName: props.user.name,
  lastName: props.user.surname,
  birthDate: props.user.birthDate ? parseDate(props.user.birthDate) : null,
  phone: props.user.phone ?? undefined,
  street: props.user.street ?? undefined,
  postalCode: props.user.postalCode ?? undefined,
  town: props.user.town ?? undefined,
});

const editingUser = ref(false);

const toast = useToast();

const authClient = useAuthClient();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  editingUser.value = true;

  const { error } = await authClient.admin.updateUser({
    userId: props.user.id,
    data: {
      name: event.data.firstName,
      surname: event.data.lastName,
      birthDate: event.data.birthDate?.toString() ?? null,
      phone: event.data.phone ?? null,
      street: event.data.street,
      postalCode: event.data.postalCode,
      town: event.data.town,
    },
  });

  if (error) {
    toast.add({
      title: "Nastala chyba",
      description: "Nastala chyba pri aktualizácii používateľa.",
    });
  } else {
    toast.add({
      title: "Používateľ aktualizovaný",
      description: "Používateľ bol úspešne aktualizovaný.",
    });
    await refreshNuxtData(`users-${props.user.id}`);
  }

  emit("close");
}
</script>

<template>
  <UModal title="Upraviť debatný klub">
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit">
        <UFormField label="Meno" name="firstName">
          <UInput v-model="state.firstName" placeholder="Zadajte krstné meno" />
        </UFormField>

        <UFormField label="Priezvisko" name="lastName">
          <UInput v-model="state.lastName" placeholder="Zadajte priezvisko" />
        </UFormField>

        <UFormField label="Dátum narodenia" name="birthDate" required>
          <UInputDate
            v-model="state.birthDate as CalendarDate | null"
            class="w-full" />
        </UFormField>

        <UFormField label="Telefónne číslo" name="phone">
          <UInput v-model="state.phone" placeholder="Zadajte telefónne číslo" />
        </UFormField>

        <UFormField label="Ulica a číslo" name="street" required>
          <UInput
            v-model="state.street"
            placeholder="Zadejte ulicu trvalého pobytu" />
        </UFormField>

        <div class="flex space-x-4">
          <UFormField label="PSČ" name="postalCode" required class="flex-1">
            <UInput
              v-model="state.postalCode"
              placeholder="Zadejte PSČ trvalého pobytu" />
          </UFormField>

          <UFormField label="Obec" name="town" required class="flex-1">
            <UInput
              v-model="state.town"
              placeholder="Zadejte obec trvalého pobytu" />
          </UFormField>
        </div>

        <UButton type="submit" block :loading="editingUser">
          Uložiť zmeny
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>
