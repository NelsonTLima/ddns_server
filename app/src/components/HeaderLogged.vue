<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

async function logout() {
  const res = await fetch('api/auth/logout', {
    method: "POST",
    credentials: "include",
  });
  if (res.ok) router.push("/");
}
</script>

<template>
  <header>
    <nav>
      <ul>
        <li><a href="" @click.prevent="logout">Logout</a></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
header {
  width: 100%;
  height: 5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-bottom: solid;
  border-color: var(--grey1);
  border-width: 0.1rem;
}

header ul {
  font-size: 1.6rem;
  margin: 2rem;
  display: flex;
  gap: 3rem;
  align-items: center;
}
</style>
