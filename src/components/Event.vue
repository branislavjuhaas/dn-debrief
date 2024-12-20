<script setup>
const props = defineProps(["event"]);

const event = props.event;

const datesAggregate = () => {
  const { beginningDate, endDate } = event;

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
  <router-link
    to="/events/new"
    class="event-card shrink-0 w-[26.875rem] h-[14.375rem] max-w-full relative rounded-[1.25rem] overflow-hidden duration-500">
    <img
      :src="event.thumbnail"
      alt=""
      class="event-image w-full h-full object-cover rounded-[1.25rem]" />
    <div
      class="top-gradient absolute top-0 left-0 w-full h-[4.1875rem] p-[1.125rem] flex">
      <p class="text-white font-bold w-full truncate -mt-0.5">
        {{ event.name }}
      </p>
    </div>
    <div
      class="bottom-gradient absolute bottom-0 left-0 w-full h-[4.1875rem] p-[1.125rem] flex items-end">
      <p class="text-white w-full truncate leading-tight -mb-1">
        {{ datesAggregate() }} - {{ event.city }}
      </p>
    </div>
  </router-link>
</template>

<style scoped>
.event-card {
  transition: transform 0.3s ease;
  overflow: hidden;
}

.event-card:hover .event-image {
  transform: scale(1.1);
}

.event-image {
  transition: transform 0.3s ease-in-out;
  transform-origin: center;
}

.top-gradient {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.6) 6.47%,
    rgba(0, 0, 0, 0.37) 60.46%,
    rgba(0, 0, 0, 0) 86.32%,
    rgba(255, 255, 255, 0) 86.32%
  );
}

.bottom-gradient {
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.6) 6.47%,
    rgba(0, 0, 0, 0.37) 49.99%,
    rgba(0, 0, 0, 0) 86.32%
  );
}
</style>
