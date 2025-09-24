<script setup>
import { ref, onMounted } from "vue";
import { getContext } from "../services/api.js";
import RecordTable from "@components/RecordTable.vue";
import HeaderLogged from "@components/HeaderLogged.vue";
import DnsAdditionForm from "@components/DnsAdditionForm.vue";
import TokenWrapper from "@components/TokenWrapper.vue";
import WebsiteFooter from "@components/WebsiteFooter.vue";

const context = ref();

onMounted(async () => {
  context.value = await getContext("/panel", { credentials: "include" });
  console.log(context.value.records);
});
</script>

<template>
  <HeaderLogged />

  <div class="content">
    <h1>HELLO, {{ context?.user.toUpperCase() }}.</h1>
    <h2>Here's your ddns records.</h2>
    
    <RecordTable
      v-if="context?.records?.length > 0"
      :context="context"
    />
    <p v-if="context?.records?.length == 0">Add your first domain.</p>
    
    <DnsAdditionForm
      :domainSuffix="'.' + context?.domainSuffix"
      :context="context"
    />
    <TokenWrapper />

  </div>

  <WebsiteFooter />
</template>

<style scoped>


.content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: scroll;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

h1 {
  width: 50rem;
  background: linear-gradient(110deg, black 0%, #dddddd 50%, black 95%);
  background-size: 300%;
  background-clip: text;
  color: transparent;
  animation: shine 8s ease-out infinite;
  text-align: center;
}

@keyframes shine {
  0% {
    background-position: 140% center;
  }
  100% {
    background-position: 0% center;
  }
}
</style>
