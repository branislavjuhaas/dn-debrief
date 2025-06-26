<script setup lang="ts">
const supabase = useSupabaseClient();

const router = useRouter();

const logout = async () => {
  const data = await supabase.auth.signOut();
  console.log("Sign out data:", data);
  if (data.error) {
    console.error("Error signing out:", data.error);
    return;
  }
  console.log("User signed out successfully");
  router.push("/");
};
</script>

<template>
  <div>
    <h1>Logout</h1>
    <form-button @click="logout">Logout</form-button>
  </div>
</template>

<style scoped></style>
