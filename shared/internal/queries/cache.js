import Redis from "ioredis";


const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: 0
});


export async function job(jobType, title, data, ttl = 60) {
  const key = `${jobType}:${title}`;
  const value = JSON.stringify(data);
  await redis.set(key, value, "EX", ttl);
}


export async function hasJob(jobType, title) {
  return Boolean(await redis.exists(`${jobType}:${title}`));
}


export async function delJob(jobType, title) {
  await redis.del(`${jobType}:${title}`);
}


export async function getSync(token) {
  return await redis.get(`sync:${token}`);
}


export async function sync(token, data, ttl = 60) {
  const key = `sync:${token}`;
  const value = JSON.stringify(data);
  await redis.set(key, value, "EX", ttl);
}


export default {
  job, hasJob, delJob, getSync, sync
}
