<script setup>
import { ref, onMounted } from "vue";
import {
  reevaluateMembersCount,
  createClub,
  createMessage,
  editClub,
  editMessage,
} from "../../firebase/structure.js";
import { useRoute, useRouter } from "vue-router";

const command = ref("");
const output = ref([]);
const route = useRoute();
const router = useRouter();
const history = ref([]);
let historyIndex = -1;

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
  help: (args) => {
    const availableCommands = {
      reevaluate: {
        description: "Reevaluate members count",
        arguments: ["--members"],
        example: "reevaluate --members",
      },
      echo: {
        description: "Echo the input",
        arguments: [":input"],
        example: "echo Hello World",
      },
      create: {
        description: "Create a new club or message",
        arguments: ["--club :name", "--message :content"],
        example: "create --club DebateClub",
      },
      exit: {
        description: "Exit the terminal and redirect to homepage",
        arguments: [],
        example: "exit",
      },
      edit: {
        description: "Edit clubs and messages",
        arguments: ["--club :id :name", "--message :id :content"],
        example: "edit --club 1234 NewName",
      },
      clear: {
        description: "Clear the terminal output",
        arguments: [],
        example: "clear",
      },
    };

    if (args.length === 0) {
      for (const cmd in availableCommands) {
        output.value.push(
          `${cmd.toUpperCase()}   -   ${availableCommands[cmd].description}`,
        );
      }
    } else {
      const cmd = args[0];
      if (availableCommands[cmd]) {
        output.value.push(`${cmd}: ${availableCommands[cmd].description}`);
        output.value.push(
          `Arguments: ${availableCommands[cmd].arguments.join(", ")}`,
        );
        output.value.push(`Example: ${availableCommands[cmd].example}`);
      } else {
        output.value.push(`No help available for command: ${cmd}`);
      }
    }
  },
  create: async (args) => {
    if (args.includes("--club")) {
      const nameIndex = args.indexOf("--club") + 1;
      const clubName = args.slice(nameIndex).join(" ");
      await createClub(clubName, true);
      output.value.push(`Club ${clubName} created successfully.`);
    } else if (args.includes("--message")) {
      const messageIndex = args.indexOf("--message") + 1;
      const messageContent = args.slice(messageIndex).join(" ");
      await createMessage(messageContent);
      output.value.push(`Message created successfully.`);
    } else {
      output.value.push("Invalid arguments for create command.");
    }
  },
  exit: () => {
    router.push("/");
  },
  edit: async (args) => {
    if (args.includes("--club")) {
      const idIndex = args.indexOf("--club") + 1;
      const clubId = args[idIndex];
      const nameIndex = idIndex + 1;
      const clubName = args[nameIndex];
      await editClub(clubId, clubName);
      output.value.push(`Club ${clubId} edited successfully.`);
    } else if (args.includes("--message")) {
      const idIndex = args.indexOf("--message") + 1;
      const messageId = args[idIndex];
      const contentIndex = idIndex + 1;
      const messageContent = args[contentIndex];
      await editMessage(messageId, messageContent);
      output.value.push(`Message ${messageId} edited successfully.`);
    } else {
      output.value.push("Invalid arguments for edit command.");
    }
  },
  clear: () => {
    output.value = [];
  },
};

const executeCommand = () => {
  const [cmd, ...args] = command.value.split(" ");
  if (commands[cmd]) {
    commands[cmd](args);
  } else {
    output.value.push("Invalid command: " + cmd);
  }
  history.value.push(command.value);
  historyIndex = history.value.length;
  command.value = "";
};

const handleKeyDown = (event) => {
  if (event.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex--;
      command.value = history.value[historyIndex];
    }
  } else if (event.key === "ArrowDown") {
    if (historyIndex < history.value.length - 1) {
      historyIndex++;
      command.value = history.value[historyIndex];
    } else {
      historyIndex = history.value.length;
      command.value = "";
    }
  }
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
    <h1>Terminál</h1>
    <div
      class="flex flex-col w-full bg-black text-white min-h-60 rounded-[1.25rem] p-5 transition-all overflow-auto scrollbar-hidden">
      <div id="terminal-output">
        <pre class="font-epilogue">{{ output.join("\n") }}</pre>
      </div>
      <div class="flex flex-row w-full items-center">
        <p class="text-white">?</p>
        <input
          v-model="command"
          class="text-white bg-black text-normal w-full px-2 border-0 focus-border-0"
          @keyup.enter="executeCommand()"
          @keydown="handleKeyDown" />
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
