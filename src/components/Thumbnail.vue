<script setup>
const props = defineProps(["id", "name", "city", "beginningDate", "endDate"]);

const datesAggregate = () => {
  let { beginningDate, endDate } = props;

  beginningDate = new Date(beginningDate);
  endDate = new Date(endDate);

  const formatDate = (date) =>
    `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  const formatShortDate = (date) => `${date.getDate()}.${date.getMonth() + 1}`;

  return beginningDate.getFullYear() === endDate.getFullYear()
    ? `${formatShortDate(beginningDate)} - ${formatShortDate(endDate)}.${endDate.getFullYear()}`
    : `${formatDate(beginningDate)} - ${formatDate(endDate)}`;
};
</script>

<template>
  <div
    class="thumbnail-card shrink-0 w-[26.875rem] h-[14.375rem] max-w-full relative rounded-[1.25rem] overflow-hidden duration-500">
    <img
      src="../assets/dn-cascade.webp"
      alt=""
      class="w-full h-full object-cover rounded-[1.25rem]" />
    <div
      class="top-gradient absolute top-0 left-0 w-full h-[4.1875rem] p-[1.125rem] flex">
      <p class="text-white font-bold w-full truncate -mt-0.5">
        {{ props.name }}
      </p>
    </div>
    <div
      class="bottom-gradient absolute bottom-0 left-0 w-full h-[4.1875rem] p-[1.125rem] flex items-end">
      <p class="text-white font-bold w-full truncate leading-tight -mb-1">
        {{ datesAggregate() }} - {{ props.city }}
      </p>
    </div>
    <div
      class="thumbnail-controls absolute grid grid-cols-2 bottom-0 h-14 p-2 w-full opacity-0 items-centers gap-2 duration-300">
      <div
        class="flex w-full h-full bg-red border-black border-2 rounded-[0.75rem_0.5rem_0.5rem_0.75rem] justify-center items-center px-4">
        <input
          type="range"
          class="appearance-none w-full border-transparent duration-300"
          value="0"
          min="0"
          max="100" />
      </div>
      <button
        class="flex bg-red h-10 items-center px-4 vertical-center rounded-[0.5rem_0.75rem_0.75rem_0.5rem] border-2 border-black justify-center hover:bg-black duration-300">
        <span>Nahrať náhľad</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.thumbnail-card:hover .top-gradient {
  top: -4.1875rem;
}

.thumbnail-card:hover .bottom-gradient {
  bottom: -4.1875rem;
}

.thumbnail-card:hover .thumbnail-controls {
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
  background: #ffffff;
  height: 4px;
  border-radius: 2px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #00e0ff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #00e0ff;
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
