<script setup>
import { ref, onMounted } from "vue";
import { reevaluateMembersCount } from "../../firebase/structure.js";
import { useRoute } from "vue-router";

const command = ref("");
const output = ref([]);
const route = useRoute();

const commands = {
  reevaluate: async (args) => {
    if (args.includes("--members")) {
      await reevaluateMembersCount();
      output.value.push("Reevaluation of members count was successful.");
    } else {
      output.value.push("Invalid arguments for reevaluate command.");
    }
  },
  echo: (args) => {
    output.value.push(args.join(" "));
  },
};

const executeCommand = () => {
  const [cmd, ...args] = command.value.split(" ");
  if (commands[cmd]) {
    commands[cmd](args);
  } else {
    output.value.push("Invalid command: " + cmd);
  }
  command.value = "";
};

onMounted(() => {
  if (route.query.command) {
    command.value = route.query.command;
    executeCommand();
  }
});
</script>

<template>
  <div class="gap-4 h-full">
    <h1 class="text-5xl font-bold mb-2">Terminál</h1>
    <div
      class="flex flex-col w-full bg-black text-white min-h-60 rounded-[1.25rem] p-5 transition-all overflow-auto">
      <div id="terminal-output">
        <pre class="font-epilogue">{{ output.join("\n") }}</pre>
      </div>
      <div class="flex flex-row w-full items-center">
        <p class="text-white">?</p>
        <input
          v-model="command"
          @keyup.enter="executeCommand()"
          class="text-white bg-black text-normal w-full px-2 border-0 focus-border-0" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .form-primary {
    background-color: black;
    color: white;
    border: 2px solid white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .form-primary:hover {
    background-color: white;
    color: black;
  }

  .focus-border-0:focus {
    outline: none;
  }
</style>