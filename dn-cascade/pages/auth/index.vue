<script setup lang="ts">
const router = useRouter();

const supabase = useSupabaseClient();

const data = reactive({
  username: "",
  password: "",
});

const login = () => {
  supabase.auth
    .signInWithPassword({
      email: data.username,
      password: data.password,
    })
    .then(({ data, error }) => {
      if (error) {
        console.error("Login failed:", error.message);
        alert("Login failed: " + error.message);
      } else {
        console.log("Login successful");
        router.push("/");
      }
    });
};

const logForm = ref(null);

onMounted(() => {
  // Wait for 3 seconds before warning
  setTimeout(() => {
    if (logForm.value) {
      logForm.value.warn("Heslo musí obsahovať aspoň 6 znakov.");
    }
  }, 3000);
});
</script>

<template>
  <app-layout title="Login">
    <form-layout ref="logForm">
      <form @submit.prevent="login" class="flex flex-col gap-4">
        <input
          v-model="data.username"
          type="email"
          placeholder="Email"
          required
          class="input" />
        <input
          v-model="data.password"
          type="password"
          placeholder="Heslo"
          required
          class="input" />
        <button type="submit" class="btn btn-primary">Prihlásiť sa</button>
      </form>
    </form-layout>
  </app-layout>
</template>

<style scoped></style>
