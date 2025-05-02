<script setup>
// define v-model prop and emit
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import { listEventFiles } from "../firebase/events.js";
import { useLoadingStore, useUserStore } from "../stores.js";
import ImagePreview from "./ImagePreview.vue";
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const sponsors = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const files = ref([]);
const searchQuery = ref("");
const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value;
  return files.value.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});
const popupVisible = ref(false);
const popupRef = ref(null);
const addButtonRef = ref(null);

const loadingStore = useLoadingStore();
const userStore = useUserStore();

onMounted(async () => {
  files.value = (await listEventFiles())
    .filter((file) => {
      // Filter by file extension
      return ["jpg", "jpeg", "png", "gif"].includes(file.name.split(".").pop());
    })
    .filter((file) => {
      // Exclude files that are already sponsors
      return !sponsors.value.some((sponsor) => sponsor.original === file.name);
    });

  document.addEventListener("click", handleClickOutside);
});

watch(
  () => props.modelValue,
  (newValue) => {
    files.value = files.value.filter((file) => {
      // Exclude files that are already sponsors
      return !newValue.some((sponsor) => sponsor.original === file.name);
    });
  },
);

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event) => {
  if (
    popupVisible.value &&
    popupRef.value &&
    !popupRef.value.contains(event.target) &&
    addButtonRef.value &&
    !addButtonRef.value.contains(event.target)
  ) {
    popupVisible.value = false;
    searchQuery.value = "";
  }
};

const togglePopup = () => {
  popupVisible.value = !popupVisible.value;
  if (!popupVisible.value) {
    searchQuery.value = "";
  }
};

const addSponsor = (file) => {
  console.log(file);

  if (file) {
    files.value = files.value.filter((f) => f.name !== file.name);

    const newFile = {
      original: file.name,
      url: file.downloadURL,
    };
    sponsors.value.push(newFile);
  }
};

const removeSponsor = (file) => {
  sponsors.value = sponsors.value.filter((f) => f.original !== file.original);
  const originalFile = {
    name: file.original,
    downloadURL: file.url,
  };
  files.value.push(originalFile);
};

const uploadFile = async () => {
  const { uploadEventFile } = await import("../firebase/events.js");

  const file = await new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    // Set filter in dialog to only for supported file types (pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png)
    input.accept = ".jpg,.jpeg,.png,.gif|*";
    input.onchange = () => resolve(input.files[0]);
    input.click();
  });

  loadingStore.loadingStart();

  uploadEventFile(file, userStore.uid, userStore.fullName)
    .then((eventResponse) => {
      console.log(eventResponse);
      const newFile = {
        original: eventResponse.fileName,
        url: eventResponse.downloadURL,
      };
      sponsors.value.push(newFile);
      loadingStore.loadingEnd();
    })
    .catch((error) => {
      console.error(error);
      loadingStore.loadingEnd();
      if (error.code === "storage/limit-exceeded") {
        filesErrorMessage.value = "Maximálna veľkosť súboru je 10 MB.";
      } else if (error.code === "storage/unauthorized") {
        filesErrorMessage.value = "Nemáte oprávnenie na nahrávanie súborov.";
      } else {
        filesErrorMessage.value = "Nastala chyba pri nahrávaní súboru.";
      }
    });
};
</script>

<template>
  <div
    class="flex flex-col w-full h-max-60 border-black border-2 rounded-[1.25rem] px-5 py-3 text-black gap-4">
    <h6 class="font-bold mb-0">Sponzori podujatia</h6>
    <div class="flex flex-row gap-4 flex-wrap items-center justify-center">
      <ImagePreview
        v-for="sponsor in sponsors"
        :key="sponsor.original"
        :file-name="sponsor.original"
        :file-path="sponsor.url"
        @remove="removeSponsor(sponsor)" />
      <div
        role="button"
        ref="addButtonRef"
        @click="togglePopup"
        class="relative border-2 border-black rounded-[1.25rem] p-2 flex flex-col items-center justify-center gap-2">
        <div class="h-32 flex flex-col items-center justify-center">
          <img
            src="./../assets/icons/plus.svg"
            alt="Image Preview"
            class="h-16 max-w-full object-contain" />
        </div>
        <p class="">Pridať sponzora</p>
        <div
          v-if="popupVisible"
          ref="popupRef"
          id="popup"
          class="absolute shadow-2xl bg-white rounded-[1.25rem_0.5rem_1.25rem_1.25rem] w-96 border-2 right-1/2 top-1/2 flex flex-col py-2 gap-2 items-center justify-center z-10">
          <template v-if="files.length > 0">
            <div class="flex flex-row gap-2 py-1 items-center w-full px-5">
              <input
                v-model="searchQuery"
                type="text"
                class="w-full"
                placeholder="Hľadať súbor"
                @click.stop />
            </div>
            <hr />
          </template>
          <div class="flex flex-col w-full px-5">
            <div
              v-if="filteredFiles.length === 0"
              class="text-left pt-1 text-grey">
              <p>Súbory nenájdené</p>
            </div>
            <div
              class="flex flex-row gap-2 items-center w-full file"
              v-for="file in filteredFiles"
              @click="addSponsor(file)"
              :key="file.name">
              <img
                src="./../assets/icons/image.svg"
                alt="Image Preview"
                class="h-5 max-w-full object-contain" />
              <p class="mt-1">{{ file.name }}</p>
            </div>
          </div>
          <hr />
          <button
            class="flex flex-row gap-2 px-5 items-center w-full file"
            @click="uploadFile">
            <img
              src="./../assets/icons/plus.svg"
              alt="Image Preview"
              class="h-5 max-w-full object-contain" />
            <p class="mt-1">Pridať súbor</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
hr {
  @apply h-[2px] bg-black w-full;
}

.file:hover {
  @apply cursor-pointer hover:text-red;
}

.file:hover > img {
  filter: brightness(0) saturate(100%) invert(32%) sepia(92%) saturate(6387%)
    hue-rotate(342deg) brightness(92%) contrast(96%);
}

input {
  @apply p-0;
}

input:focus {
  @apply outline-none border-0;
}
</style>
