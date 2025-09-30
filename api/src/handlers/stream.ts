import type { RedisOptions } from 'ioredis';
import type { Request, Response } from 'express';
import { QueueEvents } from 'bullmq'; 


const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

if (!REDIS_HOST) throw new Error("REDIS_HOST is required ");
if (!REDIS_PORT) throw new Error("REDIS_PORT is required ");

const port = parseInt(REDIS_PORT, 10);

const connection = {
  host: REDIS_HOST || "127.0.0.1",
  port: port || 6379 ,
  db: 1
} satisfies RedisOptions;

const events = new QueueEvents("dns-records", { connection });
await events.waitUntilReady();

const waiters = new Map(); //  Map<string, Set<serverResponse>>

const send = (res:  Response, event: string, data: unknown): void => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

events.on("completed", ({ jobId }) => {
  const set = waiters.get(jobId);
  if (!set || set.size === 0) return;
  for (const res of set) {
    send(res, "status", { jobId, status: "completed" });
    send(res, "end", { jobId, status: "ended" });
    res.end();
  }
  waiters.delete(jobId);
});

events.on("failed", ({ jobId }) => {
  const set = waiters.get(jobId);
  if (!set || set.size === 0) return;
  for (const res of set) {
    send(res, "status", { jobId, status: "failed" });
    send(res, "end", { jobId, status: "ended" });
    res.end();
  }
  waiters.delete(jobId);
});


export function stream(req: Request, res: Response) {
  const jobId = String(req.query.jobId || "");

  if (!jobId) return res.status(400).json({ err: "job id" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  waiters.has(jobId)
    ? waiters.get(jobId).add(res)
    : waiters.set(jobId, new Set([res]));

  const cleanup = () => {
    const s = waiters.get(jobId);
    if (s) {
      s.delete(res);
      if (s.size === 0) waiters.delete(jobId);
    }
    if (!res.writableEnded) res.end();
  };

  req.on("close", cleanup);
  res.on?.("close", cleanup);
  return;
}
