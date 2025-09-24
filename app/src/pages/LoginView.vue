<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import LoginPageHeader from "@components/LoginPageHeader.vue";
import WebsiteFooter from "@components/WebsiteFooter.vue"

const router = useRouter();
const username = ref();
const password = ref();
const feedback = ref("");

async function handleLogin() {
  try {
    const res = await fetch('/api/auth/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    if (res.ok) router.push("/panel");
    else feedback.value = "Login Failed"

  } catch (err) {
    console.log(err);
  }
}
</script>

<template>
  <LoginPageHeader />

  <div id="content">
    <h1>DDNS SERVER</h1>
    <h2>Designed and proggramed by Nelson Lima</h2>
    <p>Please log in. Default credentials are: admin / ddns-admin.</p>

    <p id="feedback">{{ feedback }}</p>
    
    <form @submit.prevent="handleLogin" id="login-form">
      <input
        v-model="username"
        type="text"
        placeholder="Username"
        required
        id="username-input"
      /><br />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        id="password-input"
      />
      <button type="submit" id="login-button">login</button>
    </form>
    <a href="#">sign in</a>
  </div>

  <WebsiteFooter />
</template>

<style scoped>
#feedback {
  color: #CC0000;
  margin-top: 2rem;
}

h1 {
  background: linear-gradient(110deg, black 0%, #dddddd 50%, black 95%);
  background-size: 300%;
  background-clip: text;
  color: transparent;
  animation: shine 8s ease-out infinite;
}

@keyframes shine {
  0% {
    background-position: 140% center;
  }
  100% {
    background-position: 0% center;
  }
}

#content {
  height: 100%;
  min-height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: scroll;
}

#login-form {
  width: 30rem;
}

#username-input {
  width: 97.5%;
}

#password-input {
  width: 97.5%;
}

#login-button {
  margin-top: 2rem;
  width: 100%;
}

p {
  max-width: 500px;
  text-align: center;
  z-index: 0;
}
</style>
