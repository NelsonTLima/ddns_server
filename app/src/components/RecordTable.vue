<script setup>
import dayjs from "dayjs";

const props = defineProps({
  context: Object
});
const emit = defineEmits(["update:context"]);

async function handleRemove(record, index) {
  const res = await fetch('api/ddns/remove', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: record.name,
    }),
  });

  const data = await res.json()
  // console.log(data)

  let newContext = props.context
  
  newContext.records[index].status = "removing";
  emit("update:context", newContext);

  if (!res.ok) {
    newContext.records[index].status = "failed";
    return;
  }

  const { jobId, stream } = data;
  const es = new EventSource("/api" + stream, { withCredentials: true });

  let  streaming = true;
  es.addEventListener("status", (e) => {
    let eventData = JSON.parse(e.data);
    if (jobId == eventData.jobId) {
      switch (eventData.status) {
        case "completed":
          newContext.records[index].status = "removed";
          break;
        default: 
          newContext.records[index].status = eventData.status;
          break;
      }
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
      console.error('SSE error', e);
    }
    console.log("Encerrando stream");
    es.close();
  }
  // window.location.reload(true);
}
</script>

<template>
  <div class="table-wrapper">
    <table>
      <colgroup>
        <col style="width: 25%" />
        <col style="width: 15%" />
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 10%" />
        <col style="width: 10%" />
      </colgroup>
      <thead>
        <tr>
          <th>Domain</th>
          <th>Content</th>
          <th>Proxy</th>
          <th>Update</th>
          <th></th>
          <th></th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(record, index) in context.records" :key="record.domain_name">
          <td>{{ record.name }}</td>
          <td>{{ record.content }}</td>
          <td>{{ record.proxied ? "yes" : "no" }}</td>
          <td>{{ dayjs(record.update).format("DD-MM HH:mm") }}</td>
          <td><a href="#">Edit</a></td>
          <td>
            <a href="#" @click.prevent="handleRemove(record, index)">Remove</a>
          </td>
          <td>{{ record.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  margin-top: 4rem;
  width: 90%;
  min-height: 18rem;
  max-width: 90rem;
  max-height: 36rem;
  overflow: scroll;
}

table {
  color: var(--grey3);
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

th {
  position: sticky;
  top: 0;
  z-index: 2;
  color: var(--grey1);
  background-color: var(--grey4);
  text-align: center;
}

td,
th {
  text-align: center;
  font-size: 1.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  overflow: hidden;
}

tr:nth-child(even) {
  background-color: var(--grey1);
}

tr:hover {
  background-color: #cccccc;
}
</style>
