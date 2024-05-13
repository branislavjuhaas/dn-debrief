<script setup>

</script>

<template>
  <div id="titlebar">
    <div id="subheader" class="centered">
      <router-link to="/">
        <img src="../assets/cascade.svg" alt="Logo"/>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
  #titlebar {
    background: var(--sda-white);
    display: flex;
    justify-content: center;
    width: 100%;
  }

  #subheader {
    display: grid;
    grid-template-columns: 1fr 31.25rem 1fr;
    align-items: center;
  }

  a {
    display: flex;
    width: min-content;
  }

  img {
    height: 2rem;
  }

  @media screen and (max-width: 850px) {
    #subheader {
      grid-template-columns: auto 1fr;
    }
  }
</style>