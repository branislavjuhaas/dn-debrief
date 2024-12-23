<script setup>
import Field from "../../components/Field.vue";
import Dropdown from "../../components/Dropdown.vue";
import Toggle from "../../components/Toggle.vue";
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getComponent,
  updateComponent,
  createComponent,
} from "../../firebase/structure.js";

const props = defineProps({
  collection: {
    type: String,
    required: true,
  },
  edit: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((field) => "name" in field);
    },
  },
});

// Create reactive refs for all field values
const fieldValues = ref({});

// Initialize field values with default values if provided
props.fields.forEach((field) => {
  fieldValues.value[field.name] =
    field.defaultValue !== undefined ? field.defaultValue : "";
});

// Initialize hidden fields with default values or null
props.fields.forEach((field) => {
  if (field.hidden) {
    fieldValues.value[field.name] =
      field.defaultValue !== undefined ? field.defaultValue : null;
  }
});

// Compute whether the form can be submitted
const canSubmit = computed(() => {
  return props.fields.every(
    (field) => field.optional || field.hidden || fieldValues.value[field.name],
  );
});

// Compute if fields length is odd
const hasOddFields = computed(
  () => props.fields.filter((field) => !field.hidden).length % 2 !== 0,
);

const route = useRoute();
const router = useRouter();

if (props.edit) {
  const id = route.params.id;
  onMounted(async () => {
    const component = await getComponent(props.collection, id);
    if (component) {
      props.fields.forEach((field) => {
        if (!field.hidden) {
          fieldValues.value[field.name] =
            component[field.name] !== undefined
              ? component[field.name]
              : field.defaultValue || "";
        } else {
          fieldValues.value[field.name] =
            component[field.name] !== undefined
              ? component[field.name]
              : field.defaultValue || null;
        }
      });
    }
  });
}

// Handle form submission
const handleSubmit = async () => {
  if (props.edit) {
    await updateComponent(props.collection, route.params.id, fieldValues.value);
  } else {
    await createComponent(props.collection, fieldValues.value);
  }
  router.go(-1) || router.push("/");
};
</script>

<template>
  <div class="gap-4">
    <h1 class="text-5xl font-bold mb-2">{{ title }}</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <template v-for="(field, index) in fields" :key="field.name">
          <template v-if="!field.hidden">
            <Field
              v-if="field.type !== 'dropdown' && field.type !== 'toggle'"
              :name="field.name"
              v-model.trim="fieldValues[field.name]"
              :label="field.title"
              :type="field.type"
              :required="!field.optional"
              :class="{ 'sm:col-span-2': hasOddFields && index === 0 }" />
            <Dropdown
              v-else-if="field.type === 'dropdown'"
              :name="field.name"
              v-model.trim="fieldValues[field.name]"
              :label="field.title"
              :options="field.options || []"
              :required="!field.optional"
              :class="{ 'sm:col-span-2': hasOddFields && index === 0 }" />
            <Toggle
              v-else
              :name="field.name"
              v-model="fieldValues[field.name]"
              :label="field.title"
              :class="{ 'sm:col-span-2': hasOddFields && index === 0 }" />
          </template>
          <!-- Removed hidden fields rendering -->
        </template>
      </div>
      <div
        class="grid grid-flow-col gap-4 items-center grid-rows-2 sm:grid-rows-1 sm:grid-cols-[1fr_auto]">
        <button
          :disabled="!canSubmit"
          @click="handleSubmit"
          class="form-primary vertical-center col-start-1 sm:col-start-2 row-start-2 sm:row-start-1">
          <span>{{ props.edit ? "Uložiť úpravy" : "Vytvoriť" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
