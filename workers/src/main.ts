import type { RedisOptions } from "ioredis";
import type { Job } from 'bullmq';
import { createRequire } from 'node:module';
import { Worker } from "bullmq";
import {
  handleDeletion,
  handlePost,
  handlePatch,
} from "./handlers/records.js";

const requires = createRequire(import.meta.url);
const Redis = requires('ioredis');

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

if (!REDIS_HOST) throw new Error("REDIS_HOST is required ");
if (!REDIS_PORT) throw new Error("REDIS_PORT is required ");

const port = parseInt(REDIS_PORT, 10);

const opts = {
  host: REDIS_HOST || "127.0.0.1",
  port: port || 6379 ,
  db: 1,
  maxRetriesPerRequest: null
} satisfies RedisOptions;

const connection = new Redis(opts);
console.log("WORKERS CONNECTED TO REDIS:");

const worker = new Worker(
  "dns-records",
  async (job: Job) => {
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

worker.on("completed", (job: Job) => {
  if (!job) throw new Error("Job is required at worker's listener");
  console.log(`Job ${job.id} has been completed!`);
});

worker.on("failed", (job: Job | undefined) => {
  if (!job) throw new Error("Job is required at worker's listener");
  console.log(`Job ${job.id} failed.`);
});
