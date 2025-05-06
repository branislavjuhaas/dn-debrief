<script setup>
import Field from "../../components/Field.vue";
import DropDown from "../../components/DropDown.vue";
import Toggle from "../../components/Toggle.vue";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getComponent,
  updateComponent,
  createComponent,
} from "../../firebase/structure.js";
import { useUserStore } from "../../stores.js";
import { formatISODate } from "../../helpers/utilities.js";

// Watch for changes in userstore.uid and load the document if it changes
const userStore = useUserStore();

const props = defineProps({
  collection: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: false,
    default: null,
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

const getCurrentId = () => {
  const route = useRoute();

  const id = props.id || route.params.id;

  // If the id is 'me', return the current user's uid
  if (props.collection === "users" && id === "me") {
    const user = userStore;
    return user.uid;
  }

  return id;
};

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
    (field) =>
      field.optional ||
      field.hidden ||
      (field.type === "toggle" &&
        fieldValues.value[field.name] !== undefined) ||
      fieldValues.value[field.name],
  );
});

// Compute if fields length is odd
const hasOddFields = computed(
  () => props.fields.filter((field) => !field.hidden).length % 2 !== 0,
);

const loadEditedDocument = async () => {
  const id = getCurrentId();
  let component = null;

  if (props.collection === "users" && props.id === "me") {
    component = userStore;
  } else {
    component = await getComponent(props.collection, id);
  }

  if (component) {
    props.fields.forEach((field) => {
      let value = component[field.name];

      // Convert Firestore Timestamp to Date and then to ISO format string
      if (
        field.type === "date" &&
        value &&
        typeof value.toDate === "function"
      ) {
        value = formatISODate(value.toDate());
      } else if (field.type === "date" && value instanceof Date) {
        value = formatISODate(value);
      }

      if (!field.hidden) {
        fieldValues.value[field.name] =
          value !== undefined ? value : field.defaultValue || "";
      } else {
        fieldValues.value[field.name] =
          value !== undefined ? value : field.defaultValue || null;
      }
    });
  }
};

const router = useRouter();

if (props.edit) {
  const id = getCurrentId();
  onMounted(async () => {
    await loadEditedDocument();
  });
}

watch(
  () => userStore.uid,
  (newUid) => {
    if (newUid && props.edit) {
      loadEditedDocument();
    }
  },
);

// Handle form submission
const handleSubmit = async () => {
  // Create a copy of fieldValues to avoid modifying the reactive object directly
  const processedValues = { ...fieldValues.value };

  // Process date fields: convert ISO date strings to Date objects
  props.fields.forEach((field) => {
    if (field.type === "date" && processedValues[field.name]) {
      processedValues[field.name] = new Date(processedValues[field.name]);
    }
  });

  if (props.edit) {
    await updateComponent(props.collection, getCurrentId(), processedValues);

    if (!(props.collection === "users" && props.id === "me")) return;
    userStore.updateUser(processedValues);
  } else {
    await createComponent(props.collection, processedValues);
  }
  router.go(-1) || router.push("/");
};
</script>

<template>
  <div class="gap-4">
    <h1>{{ title }}</h1>
    <div
      class="flex flex-col justify-between w-full bg-white min-h-60 rounded-[1.25rem] p-5 gap-16">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <template v-for="(field, index) in fields" :key="field.name">
          <template v-if="!field.hidden">
            <Field
              v-if="field.type !== 'dropdown' && field.type !== 'toggle'"
              v-model.trim="fieldValues[field.name]"
              :name="field.name"
              :label="field.title"
              :type="field.type"
              :required="!field.optional"
              :class="{ 'sm:col-span-2': hasOddFields && index === 0 }" />
            <DropDown
              v-else-if="field.type === 'dropdown'"
              v-model.trim="fieldValues[field.name]"
              :name="field.name"
              :label="field.title"
              :options="field.options || []"
              :required="!field.optional"
              :class="{ 'sm:col-span-2': hasOddFields && index === 0 }" />
            <Toggle
              v-else
              v-model="fieldValues[field.name]"
              :name="field.name"
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
          class="form-primary vertical-center col-start-1 sm:col-start-2 row-start-2 sm:row-start-1"
          @click="handleSubmit">
          <span>{{ props.edit ? "Uložiť úpravy" : "Vytvoriť" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
