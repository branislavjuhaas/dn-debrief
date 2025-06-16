<script setup lang="ts">
const supabase = useSupabaseClient();

// add await to wait 3 seconds before loading the page
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
await delay(3000);

const x = 100;

const router = useRouter();

const logout = async () => {
  try {
    supabase.auth.signOut();
    router.push("/");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
</script>

<template>
  <div>
    <h1>Logout</h1>
    <button @click="logout">Logout</button>
    <div class="flex flex-col">
      <p v-for="i in Array.from({ length: x }, (_, i) => i + 1)" :key="i">
        {{ i }}
      </p>
    </div>
  </div>
</template>

<style scoped></style>
