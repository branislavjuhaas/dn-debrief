<script setup>
import { ref } from "vue";
import { signInWithGoogle, signInWithEmail } from "../firebase.js";
import { useStatesStore } from "../stores/stores.js";
import InputChip from "../components/InputChip.vue";
import AtIcon from "../assets/icons/At-f.svg";
import VaultIcon from "../assets/icons/Vault-f.svg";

const email = ref("");
const password = ref("");

const emailLogin = async () => {
  useStatesStore().startLoading();
  signInWithEmail(email.value, password.value);
};

const googleLogin = async () => {
  useStatesStore().startLoading();
  signInWithGoogle();
};
</script>

<template>
  <div>
    <h1>Prihlásenie do účtu</h1>
    <div id="form">
      <div id="alternatives">
        <button class="alternative-button" @click="signInWithGoogle">
          <img
            class="alternative-icon"
            src="../assets/icons/Google-f.svg"
            alt="G"
          />
          <p class="one-line">Prihlásiť pomocou účtu Google</p>
        </button>
        <router-link to="auth/create" class="alternative-button">
          <img
            class="alternative-icon"
            src="../assets/icons/CaretCircleAdd-f.svg"
            alt="+"
          />
          <p class="one-line">Vytvoriť nový účet</p>
        </router-link>
      </div>
      <input-chip v-model="email" type="text" :icon="AtIcon" title="Email" />
      <input-chip
        v-model="password"
        type="password"
        :icon="VaultIcon"
        title="Heslo"
      />
      <div id="form-buttons">
        <router-link to="auth/reset" class="secondary-button"
          ><img
            class="alternative-icon"
            src="../assets/icons/Envelope-f.svg"
            alt="M"
          />
          <p class="one-line">Obnoviť heslo</p></router-link
        >

        <button class="primary-button" @click="emailLogin">
          <p class="one-line">Prihlásiť</p>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

#alternatives {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

#form-buttons {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.25rem;
}

.alternative-button {
  display: grid;
  grid-template-columns: 1.25rem 1fr;
  gap: 0.625rem;
  padding: 0 1.25rem;
  height: 6rem;
  border-radius: 1.25rem;
  background: var(--sda-white);
  color: var(--sda-black);
  align-items: center;
  justify-items: start;
  font-family: "Epilogue", sans-serif;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.alternative-icon {
  width: 1.25rem;
}

@media screen and (max-width: 530px) {
  #alternatives {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    order: 3;
  }

  .alternative-button {
    height: 3rem;
  }
}
</style>
