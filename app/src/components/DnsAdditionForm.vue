<script setup>
import { ref } from "vue";

const props = defineProps({
  domainSuffix: String,
  context: Object,
});
const emit = defineEmits(["update:context"]);

const req = ref({});
req.value.proxy = false;

async function handleAddition() {
  const res = await fetch("/api/ddns/add", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.value),
  });

  const data = await res.json();
  console.log(data);

  let newContext = props.context;

  let index =
    newContext.records.push({
      name: req.value.name + props.domainSuffix,
      content: req.value.content,
      proxy: false,
      status: "requested",
    }) - 1;
  emit("update:context", newContext);

  if (!res.ok) {
    newContext.records[index].status = "failed";
    return;
  }

  const { jobId, stream } = data;
  const es = new EventSource("/api" + stream, { withCredentials: true });

  let streaming = true;
  es.addEventListener("status", (e) => {
    let eventData = JSON.parse(e.data);
    if (jobId == eventData.jobId) {
      newContext.records[index].status = eventData.status;
      emit("update:context", newContext);
    }
  });

  es.addEventListener("end", (e) => {
    let eventData = JSON.parse(e.data);
    if (jobId == eventData.jobId) {
      streaming = false;
    }
  });

  es.onerror = (e) => {
    if (streaming) {
      console.error("SSE error", e);
    }
    console.log("Encerrando stream");
    es.close();
  };
  // window.location.reload(true);
}
</script>

<template>
  <form id="domain-form" @submit.prevent="handleAddition">
    <div id="name-input">
      <input
        v-model="req.name"
        type="text"
        placeholder="Your Dynamic Subdomain"
        id="subdomain"
        required
      />
      <input type="text" :value="domainSuffix" readonly id="domain" />
    </div>

    <div id="content-proxy-inputs">
      <input
        v-model="req.content"
        type="text"
        placeholder="Optional IPv4, IPv6 or CNAME"
        id="content-input"
      />

      <select v-model="req.proxy" id="proxy-input">
        <option :value="false">unproxied</option>
        <option :value="true">proxied</option>
      </select>
    </div>

    <button id="add-button">ADD SUBDOMAIN</button>
  </form>
</template>

<style scoped>
#domain-form {
  width: 90%;
  max-width: 75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

#name-input {
  display: flex;
  justify-content: center;
  align-items: center;
}

#domain {
  width: 40%;
  background: #aaaaaa;
  color: white;
  border-color: black;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-left-width: 0.1rem;
}

#subdomain {
  width: 60%;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
  border-right-width: 0.1rem;
}

#add-button {
  width: 100%;
}

#content-proxy-inputs {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

#content-input {
  width: 80%;
}

#proxy-input {
  width: 20%;
}
</style>
