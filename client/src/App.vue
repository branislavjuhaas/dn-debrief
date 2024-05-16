<script setup>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <div id="view">
    <Header />
    <div id="content">
      <div class="centered">
        <router-view id="router" v-slot="{ Component }">
          <Transition name="slide" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </div>
    <Footer />
    <transition name="fade">
      <div v-if="loading" id="loader"></div>
    </transition>
  </div>
</template>

<style scoped>
#view {
  display: grid;
  grid-template-rows: 3.75rem 1fr 3.75rem;
  grid-template-columns: 100%;
  height: 100%;
  width: 100%;
}

#content {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: scroll;
  scrollbar-width: none;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.21s,
    opacity 0.21s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(30%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
