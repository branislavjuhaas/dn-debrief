<script setup>
import { ref, watch } from "vue";

const props = defineProps(["readonly", "title", "value", "name", "type"]);
const editing = ref(false);
const value = ref(props.value);
const confirmedValue = ref(props.value);
const emit = defineEmits(["update"]);

watch(
  () => props.value,
  (newValue) => {
    value.value = newValue;
    confirmedValue.value = newValue;
  },
);
</script>

<template>
  <div
    class="grid min-h-12 border-2 border-black border-opacity-0 rounded-[1.25rem] px-5 pt-1 gap-4 grid-cols-[auto_1fr] auto-cols-auto grid-flow-col text-black items-center duration-300 overflow-hidden"
    :class="{
      'cursor-pointer': !props.readonly,
      'border-opacity-100': editing,
    }"
    @click="
      editing = !props.readonly && true;
      $nextTick(() => {
        const input = $el.querySelector('input');
        input.focus();
      });
    ">
    <p class="font-bold">{{ props.title }}</p>
    <div class="flex flex-row gap-4">
      <input
        v-if="editing"
        v-model="value"
        class="text-right w-full"
        :type="props.type"
        :placeholder="!props.value ? 'zadaj hodnotu' : ''" />
      <p v-else class="text-right w-full" :class="{ italic: props.readonly || !props.value, 'text-grey': !props.value }">
        {{ confirmedValue ? confirmedValue : 'zadaj hodnotu' }}
      </p>
      <Transition name="fly">
        <div v-if="editing" class="flex flex-row gap-2">
          <button
            class="w-5 h-5"
            @click.stop="
              value = confirmedValue;
              editing = false;
            ">
            <img src="./../assets/icons/cross.svg" alt="X" class="w-5" />
          </button>
          <button
            class="w-5 h-5"
            @click.stop="
              if (value !== confirmedValue) {
                emit('update', props.name, value);
              }
              confirmedValue = value;
              editing = false;
            ">
            <img src="./../assets/icons/check.svg" alt="√" class="w-5" />
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
input {
  border: none;
  outline: none;
}

input:focus {
  border: none;
  outline: none;
}

.fly-enter-active,
.fly-leave-active {
  transition: transform 0.3s;
}

.fly-enter-from,
.fly-leave-to {
  transform: translateX(100%);
}

.fly-enter-to,
.fly-leave-from {
  transform: translateX(0);
}
</style>
