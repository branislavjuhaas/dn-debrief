<script setup>
// THIS FILE DOESN'T USE FIREBASE

import { ref } from "vue";
import { uploadThumbnailImage, relevantEvents } from "../firebase/events.js";
import { defineExpose } from "vue";
import defaultThumbnail from "../assets/dn-cascade.webp";

const props = defineProps([
  "id",
  "name",
  "city",
  "beginningDate",
  "endDate",
  "disabled",
  "thumbnailPath",
]);

const selectedImage = ref(null);

const imageWidth = ref(0);
const imageHeight = ref(0);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      imageWidth.value = img.width;
      imageHeight.value = img.height;

      selectedImage.value = objectUrl;
    };
  }
};

const useSampleImage = async () => {
  let availableThumbnails = [
    "defaults/01.jpg",
    "defaults/02.jpg",
    "defaults/03.jpg",
    "defaults/04.jpg",
    "defaults/05.jpg",
  ];

  const events = await relevantEvents();

  // From the available events, go trough them and remove event.thumbnail from the list if it is there
  for (let event of events) {
    availableThumbnails = availableThumbnails.filter(
      (thumbnail) => thumbnail !== event.originalThumbnail,
    );
  }

  console.log(availableThumbnails);

  if (availableThumbnails.length === 0) {
    return "defaults/DN Cascade.png";
  }

  const randomIndex = Math.floor(Math.random() * availableThumbnails.length);
  return availableThumbnails[randomIndex];
};

const uploadThumbnail = async () => {
  if (!selectedImage.value) return useSampleImage();

  const img = new Image();
  img.src = selectedImage.value;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const targetWidth = 645;
  const targetHeight = 345;
  const targetAspect = targetWidth / targetHeight;

  const imgAspect = img.width / img.height;

  let sourceWidth, sourceHeight;
  let sourceX, sourceY;

  if (imgAspect > targetAspect) {
    // Image is wider than target aspect ratio
    sourceHeight = img.height;
    sourceWidth = sourceHeight * targetAspect;
    sourceX = (img.width - sourceWidth) / 2;
    sourceY = 0;
  } else {
    // Image is taller than target aspect ratio
    sourceWidth = img.width;
    sourceHeight = sourceWidth / targetAspect;
    sourceX = 0;
    sourceY = (img.height - sourceHeight) / 2;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg");
  });

  const path = await uploadThumbnailImage(props.id, blob);

  return path || useSampleImage();
};

defineExpose({
  uploadThumbnail,
});

const datesAggregate = () => {
  let { beginningDate, endDate } = props;

  console.log(beginningDate, endDate);

  beginningDate = new Date(beginningDate);
  endDate = new Date(endDate);

  if (isNaN(beginningDate) || isNaN(endDate)) {
    return "Dátumy podujatia";
  }

  const formatDate = (date) =>
    `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  const formatShortDate = (date) => `${date.getDate()}.${date.getMonth() + 1}`;

  return beginningDate.getDate() === endDate.getDate()
    ? formatDate(beginningDate)
    : beginningDate.getFullYear() === endDate.getFullYear()
      ? `${formatShortDate(beginningDate)} - ${formatDate(endDate)}`
      : `${formatDate(beginningDate)} - ${formatDate(endDate)}`;
};
</script>

<template>
  <div
    class="thumbnail-card shrink-0 w-[26.875rem] h-[14.375rem] max-w-full relative rounded-[1.25rem] overflow-hidden flex items-center justify-center"
    :class="{ disabled: props.disabled }">
    <img
      v-if="selectedImage"
      :src="selectedImage"
      alt=""
      class="object-cover w-full h-full rounded-[1.25rem]" />
    <img
      v-else
      :src="props.thumbnailPath || defaultThumbnail"
      alt=""
      class="w-full h-full object-cover rounded-[1.25rem]" />
    <div
      class="top-gradient absolute top-0 left-0 w-full h-[4.1875rem] p-[1.125rem] flex">
      <p class="text-white font-bold w-full truncate -mt-0.5">
        {{
          props.name && props.name !== ""
            ? props.name
            : "Názov tvoreného podujatia"
        }}
      </p>
    </div>
    <div
      class="bottom-gradient absolute bottom-0 left-0 w-full h-[4.1875rem] p-[1.125rem] flex items-end">
      <p class="text-white w-full truncate leading-tight -mb-1">
        {{ datesAggregate() }} - {{ props.city !== "" ? props.city : "Mesto" }}
      </p>
    </div>
    <div
      class="thumbnail-controls flex absolute bottom-0 h-14 p-2 w-full opacity-0 items-centers gap-4 duration-300">
      <button
        @click="$refs.fileInput.click()"
        class="flex w-full bg-red h-10 items-center px-4 vertical-center rounded-[0.75rem] border-2 border-black justify-center hover:bg-black duration-300">
        <span>Nahrať náhľad</span>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          @change="handleFileChange" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.thumbnail-card:not(.disabled):hover .top-gradient {
  top: -4.1875rem;
}

.thumbnail-card:not(.disabled):hover .bottom-gradient {
  bottom: -4.1875rem;
}

.thumbnail-card:not(.disabled):hover .thumbnail-controls {
  opacity: 1;
}

.top-gradient {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.6) 6.47%,
    rgba(0, 0, 0, 0.37) 60.46%,
    rgba(0, 0, 0, 0) 86.32%,
    rgba(255, 255, 255, 0) 86.32%
  );
  transition: top 0.3s ease;
}

.bottom-gradient {
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.6) 6.47%,
    rgba(0, 0, 0, 0.37) 49.99%,
    rgba(0, 0, 0, 0) 86.32%
  );
  transition: bottom 0.3s ease;
}

input[type="range"] {
  -webkit-appearance: none;
  background: #00e0ff;
  height: 4px;
  border-radius: 2px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #1480c2;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #1480c2;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.2);
}
</style>
