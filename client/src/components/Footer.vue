<script setup>
import { computed } from "vue";
import { useUserStore } from "../stores/user.js";

const userStore = useUserStore();
const username = computed(() => userStore.fullName || "Prihlásiť sa");
const link = computed(() => (userStore.fullName ? "/users/me" : "/auth"));
</script>

<template>
  <div id="footer">
    <div id="subfooter" class="centered">
      <p class="one-line footer-link">2024 Slovenská debatná asociácia</p>
      <div id="right-footer">
        <a href="https://www.sda.sk/" class="one-line footer-link"
          >Viac o SDA</a
        >
        <router-link to="/manage" class="one-line footer-link"
          >Organizátor - Správa</router-link
        >
        <router-link :to="link" id="me" class="one-line footer-link primary">{{
          username
        }}</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
#footer {
  background: var(--sda-white);
  display: flex;
  justify-content: center;
  width: 100%;

  color: var(--sda-black);
}

#footer a {
  color: var(--sda-black);
}

#subfooter {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
}

#right-footer {
  display: flex;
  gap: 3rem;
  grid-column: 3;
}

@media screen and (max-width: 630px) {
  #subfooter {
    grid-template-columns: 1fr;
  }

  .footer-link:not(.primary) {
    display: none;
  }

  #right-footer {
    grid-column: 1;
  }

  #me {
    width: 100%;
  }
}
</style>
