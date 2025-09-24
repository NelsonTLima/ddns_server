<script setup>
import { ref } from "vue";

const token = ref("");
const link = ref("Show again");

async function getToken() {
  const hideLink = document.getElementById("hide-link");
  
  const res = await fetch('/api/auth/newtoken', {
    method: "POST",
    credentials: "include",
  });
  const json = await res.json();
  token.value = json.data;

  hideLink.style.display = "block";
  alert(`After leaving or refreshing this page you can only replace this token with a new one. Make sure to copy it to a safe place.\n\nToken:\n\n${token.value}`)
}

function hideAndShow() {
  if (!token.value) return;

  const tokenText = document.getElementById("token");

  if (tokenText.style.display == "" || tokenText.style.display == "none") {
    // tokenText.style.filter = "blur(.2rem)";
    tokenText.style.display = "block"
    link.value = "Hide"
  } else {
    // tokenText.style.filter = "";
    tokenText.style.display = "none"
    link.value = "Show again"
  }
}
</script>

<template>
  <button @click="getToken">NEW API TOKEN</button>

  <span></span>
  <br />
  <p id="token">{{ token }}</p>
  <br />
  <a @click="hideAndShow" id="hide-link" href="#">{{ link }}</a>
</template>

<style scoped>
button {
  width: 90%;
  max-width: 75rem;
}

span {
  display: block;
  justify-content: center;
}

#token {
  display: none;
}

#hide-link {
  display: none;
}

</style>
