<script setup>
import { ref, watch } from "vue";
import Eye from "../assets/icons/Eye-r.svg";
import EyeSlash from "../assets/icons/EyeSlash-r.svg";
const props = defineProps(["type", "icon", "title", "modelValue"]);

const input = ref("");
const visibility = ref("password");

const emit = defineEmits(["update:modelValue"]);

watch(input, () => {
  emit("update:modelValue", input.value);
});
</script>

<template>
  <div class="chip">
    <img :src="props.icon" class="input-icon" alt="Person" />
    <h6 class="input-title">{{ props.title }}</h6>
    <input
      v-if="props.type === 'text'"
      type="text"
      placeholder="_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _"
      class="input-text"
      v-model="input"
    />
    <input
      v-else-if="props.type === 'password'"
      :type="visibility"
      placeholder="_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _"
      class="input-text"
      v-model="input"
    />
    <img
      v-if="props.type === 'password'"
      @click="visibility = visibility === 'text' ? 'password' : 'text'"
      :src="visibility === 'text' ? Eye : EyeSlash"
      class="input-help"
      alt="Visible"
    />
  </div>
</template>

<style scoped>
.chip {
  height: 3.1rem;
  display: grid;
  grid-template-columns: 1.25rem 1fr 1.25rem;
  grid-template-rows: 1.25rem 1fr;
  grid-template-areas:
    "icon title hint"
    "input input input";
  padding: 12px 20px;
  border-radius: 1.25rem;
  background: var(--sda-white);
  color: var(--sda-black);
  align-items: end;
}

.input-icon {
  grid-area: icon;
  width: 1.25rem;
}

.input-title {
  grid-area: title;
  margin: 0 0 0 0.5rem;
}

.input-text {
  grid-area: input;
  border: none;
  background: none;
  color: var(--sda-black);
  font-size: 1rem;
  font-weight: 500;
  width: 100%;
  outline: none;
  padding: 0;
  margin: 0;
  caret-color: var(--sda-black);
  font-family: "Epilogue", sans-serif;
}

input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

.input-help {
  grid-area: hint;
  cursor: pointer;
  width: 1.25rem;
}
</style>
