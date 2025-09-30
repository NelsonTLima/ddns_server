import type { Request, Response } from 'express';
import type { RedisOptions } from 'ioredis'; 
import { Queue } from "bullmq";
import { randomBytes } from "crypto";
import db from "@ddns/internal/queries/db";
import cache from "@ddns/internal/queries/cache";
import helper from "#helpers"

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


const queue = new Queue("dns-records", { connection });

const defaultJobConfig = {
  removeOnComplete: true,
  removeOnFail: true,
  attempts: 2,
  backoff: {
    type: "fixed",
    delay: 1000,
  },
};


export async function post(req: Request, res: Response) {
  const { user_id, username } = req.auth;
  const { name, content, proxy } = req.body;

  if (await db.isNameInRecords(name)) return res.conflict();
  if (await cache.hasJob("post", name)) return res.conflict();
  if (await cache.hasJob("delete", name)) return res.conflict();
  if (await cache.hasJob("patch", name)) return res.conflict();

  cache.job("post", name);

  const jobId = randomBytes(16).toString("hex");
  const job = await queue.add(
    "post",
    { user_id, username, name, content, proxy }, // payload
    { jobId, ...defaultJobConfig }
  );

  return res.status(202).json({
    jobId: job.id,
    stream: `/ddns/jobs/stream?jobId=${job.id}`,
  });
}


export async function remove(req: Request, res: Response) {
  const { name } = req.body;

  const record = await db.getRecordByName(name);
  if (!record) return res.success();

  if (record.user_id !== req.auth.user_id) return res.unauthorized();

  if (await cache.hasJob("delete", name)) return res.conflict();
  cache.job("delete", name);

  const id = record.cloudflare_id;
  const jobId = randomBytes(16).toString("hex");
  
  const job = await queue.add(
    "delete",
    { id, name },
    { jobId, ...defaultJobConfig },
  );

  return res.status(202).json({
    jobId: job.id,
    stream: `/ddns/jobs/stream?jobId=${job.id}`,
  });
}


export async function update(req: Request, res: Response) {
  const { name, content } = req.body;
  // const { user_id, username } = req.auth;

  const record = await db.getRecordByName(name);

  console.log(record);
  if (!record) return res.notFound();

  if (record.content === content) return res.success();
  //if (record.user_id !== req.auth.user_id) return res.unauthorized();

  if (await cache.hasJob("patch", name)) return res.conflict();
  if (await cache.hasJob("delete", name)) return res.conflict();
  cache.job("patch", name);

  const id = record.cloudflare_id;
  const proxy = record.proxy;
  console.log(id);

  await queue.add(
    "patch",
    { id, name, content, proxy },
    defaultJobConfig
  );

  return res.status(200).json(req.body);
}


export async function sync(req: Request, res: Response) {
  let content = req.body.ip;

  let actual_records = await db.getNamesByUserId(req.auth.user_id);
  let requested_records = req.body.domains.sort(
    (a: any, b: any) => a.name.localeCompare(b.name)
  );

  const updates = helper.filterUpdates(requested_records, actual_records); 

  for (const update of updates) {
    let id = update.id;
    let name = update.name;
    let proxy = update.proxy;
    let oldProxy = update.oldProxy;
    let oldContent = update.oldContent;

    if (await cache.hasJob('patch', name)) continue
    if (content == oldContent && proxy == oldProxy) {
      continue;
    }
    
    cache.job('patch', name);

    await queue.add(
      "patch",
      { id, name, content, proxy },
      defaultJobConfig,
    );
  }

  const sync_session = randomBytes(32).toString("hex");
  req.body.sync_session = sync_session;
  await cache.sync(sync_session, req.body);
  
  return res.success({
    sync_session: sync_session,
  });
}

export default {
  post,
  remove,
  update,
  sync
};
