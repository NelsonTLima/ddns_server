import { Worker } from "bullmq";
import IORedis from "ioredis";
import {
  handleDeletion,
  handlePost,
  handlePatch,
} from "./src/handlers/records.js";

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: 1,
  maxRetriesPerRequest: null,
});
console.log("WORKERS CONNECTED TO REDIS:");

const worker = new Worker(
  "dns-records",
  async (job) => {
    switch (job.name) {
      case "delete":
        return await handleDeletion(job);
      case "patch":
        return await handlePatch(job);
      case "post":
        return await handlePost(job);
      default:
        throw new Error(`Unkdown job: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has been completed!`);
});

worker.on("failed", (job) => {
  console.log(`Job ${job.id} failed.`);
});
