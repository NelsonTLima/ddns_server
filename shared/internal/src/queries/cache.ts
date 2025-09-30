import type { RedisOptions } from 'ioredis';
import { createRequire } from 'node:module';

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
  db: 0
} satisfies RedisOptions;

const redis = new Redis(opts);

export async function job(jobType: string, title: string, ttl = 60){
  const key = `${jobType}:${title}`;
  await redis.set(key, "1" ,"EX", ttl);
}


export async function hasJob(jobType: string, title: string) {
  return Boolean(await redis.exists(`${jobType}:${title}`));
}


export async function delJob(jobType: string, title: string) {
  await redis.del(`${jobType}:${title}`);
}


export async function getSync(token: string) {
  return await redis.get(`sync:${token}`);
}


export async function sync(token: string, data: Object, ttl = 60) {
  const key = `sync:${token}`;
  const value = JSON.stringify(data);
  await redis.set(key, value, "EX", ttl);
}


export default {
  job, hasJob, delJob, getSync, sync
}
