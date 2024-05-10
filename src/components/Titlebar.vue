<script setup>

</script>

<template>
  <div id="titlebar">
    <div id="centered">
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
  }

  #centered {
    max-width: calc(100% - 40px);
    width: 1320px;
    margin: 0 20px 0 20px;

    display: grid;
    grid-template-columns: 1fr 500px 1fr;
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
    #centered {
      grid-template-columns: auto 1fr;
    }
  }
</style>