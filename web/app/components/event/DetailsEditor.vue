<script setup lang="ts">
import type { Event } from "#shared/types/event";
import { LazyModalThumbnailCropper } from "#components";
import z from "zod";
import { leagueEnum, regionEnum } from "#server/db/schema/clubs";
import { eventTypeEnum } from "#server/db/schema/events";

const toast = useToast();
const overlay = useOverlay();

const model = defineModel<Partial<Event>>({
  default: () => ({}),
});

const sideForm = useTemplateRef("sideForm");

const validate = async () => {
  if (!sideForm.value) return false;

  const result = await sideForm.value.validate({ silent: true });
  return result;
};

defineExpose({
  validate,
});

const sideSchema = z.object({
  thumbnailUrl: z.url("Náhľadová snímka podujatia musí byť URL").nullish(),
  type: z
    .enum(eventTypeEnum.enumValues, {
      message: "Neplatný typ podujatia",
    })
    .optional(),
  place: z.string().min(1, "Miesto konania podujatia je povinný údaj"),
  targetRegion: z.enum(regionEnum.enumValues).nullish(),
  targetLeague: z.enum(leagueEnum.enumValues).nullish(),
});

const uploadThumbnail = async (file: File | null | undefined) => {
  if (!file) return;

  const modal = overlay.create(LazyModalThumbnailCropper);
  const instance = modal.open({
    file,
  });

  const result = await instance.result;
  if (!result) return;

  try {
    const data = await $fetch("/api/events/thumbnails/upload", {
      method: "POST",
    });

    if (!data?.uploadUrl) return;

    // 2. Upload cropped image blob directly to storage bucket (R2/S3)
    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": result.type,
      },
      body: result,
    });

    model.value.thumbnailUrl = data.publicUrl;
  } catch (error) {
    toast.add({
      title: "Nastala chyba",
      description: "Nepodarilo sa nahrát náhľadovú snímku",
      color: "error",
    });
  }
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[1fr_31rem]">
    <div></div>
    <UForm
      ref="sideForm"
      :schema="sideSchema"
      :state="model"
      class="flex flex-col gap-4 border-l border-default pl-4">
      <UFormField
        label="Náhľadová snímka podujatia"
        :ui="{ container: 'h-full' }"
        class="row-span-3 h-full">
        <UCard
          v-if="model.thumbnailUrl"
          class="aspect-21/9 flex"
          :ui="{
            body: 'flex h-full w-full p-0 sm:p-0 items-center justify-center',
          }">
          <NuxtImg
            :src="model.thumbnailUrl"
            alt="Náhľadová snímka podujatia"
            width="645" />
        </UCard>
        <UFileUpload
          v-else
          :preview="false"
          label="Potiahnite obrázok alebo kliknite sem"
          accept="image/*"
          class="w-full aspect-21/9"
          @update:modelValue="uploadThumbnail" />
      </UFormField>

      <UFormField label="Typ podujatia" name="type" required>
        <USelect
          v-model="model.type"
          placeholder="Vyberte typ podujatia"
          class="w-full"
          :items="[
            {
              label: 'Turnaj',
              value: 'tournament',
            },
            {
              label: 'Seminár',
              value: 'workshop',
            },
            {
              label: 'Iný typ podujatia',
              value: 'other',
            },
          ]" />
      </UFormField>

      <UFormField label="Miesto konania podujatia" name="place" required>
        <UInput
          v-model="model.place as string | undefined"
          placeholder="Zadajte miesto podujatia (napr. Košice)" />
      </UFormField>

      <template v-if="model.type === 'tournament'">
        <UFormField label="Debatný program" name="targetLeague" required>
          <USelect
            v-model="model.targetLeague as string | undefined"
            placeholder="Vyberte debatný program"
            class="w-full"
            :items="[
              {
                label: 'Základoškolský debatný program',
                value: 'junior',
              },
              {
                label: 'Stredoškolský debatný program',
                value: 'senior',
              },
              {
                label: 'Vysokoškolský debatný program',
                value: 'university',
              },
            ]" />
        </UFormField>

        <UFormField label="Cieľový región" name="targetRegion" required>
          <USelect
            v-model="model.targetRegion"
            placeholder="Vyberte cieľový región"
            class="w-full"
            :items="[
              {
                label: 'Západoslovenský región',
                value: 'western',
              },
              {
                label: 'Stredoslovenský región',
                value: 'central',
              },
              {
                label: 'Východoslovenský región',
                value: 'eastern',
              },
              {
                label: 'Celoslovenské podujatie',
                value: null,
              },
            ]" />
        </UFormField>
      </template>
    </UForm>
  </div>
</template>
