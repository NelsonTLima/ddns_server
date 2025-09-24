import { Queue, QueueEvents } from "bullmq";
import { randomBytes } from "crypto";
import db from "#queries/db.js";
import cache from "#queries/cache.js";
import helper from "#helpers"


const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: 1,
};

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

const events = new QueueEvents("dns-records", { connection });
await events.waitUntilReady();

const waiters = new Map(); //  Map<string, Set<serverResponse>>

const send = (res, event, data) => {
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


async function jobStream(req, res) {
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
}


async function post(req, res) {
  const { userId, username } = req.auth;
  const { name, content, proxy } = req.body;

  if (await db.isNameInRecords(name)) return res.conflict();
  if (await cache.hasJob("post", name)) return res.conflict();
  if (await cache.hasJob("delete", name)) return res.conflict();
  if (await cache.hasJob("patch", name)) return res.conflict();

  cache.job("post", name);

  const jobId = randomBytes(16).toString("hex");
  const job = await queue.add(
    "post",
    { userId, username, name, content, proxy }, // payload
    { jobId },
    defaultJobConfig,
  );

  res.status(202).json({
    jobId: job.id,
    stream: `/ddns/jobs/stream?jobId=${job.id}`,
  });
}


async function remove(req, res) {
  const { name } = req.body;

  const record = await db.getRecordByName(name);
  if (!record) return res.success();

  if (record.user_id !== req.auth.userId) return res.unauthorized();

  if (await cache.hasJob("delete", name)) return res.conflict();
  cache.job("delete", name);

  const id = record.cloudflare_id;
  const jobId = randomBytes(16).toString("hex");
  
  const job = await queue.add(
    "delete",
    { id, name },
    { jobId },
    defaultJobConfig,
  );

  res.status(202).json({
    jobId: job.id,
    stream: `/ddns/jobs/stream?jobId=${job.id}`,
  });
}


async function update(req, res) {
  const { name, content } = req.body;
  // const { userId, username } = req.auth;

  const record = await db.getRecordByName(name);

  console.log(record);
  if (!record) return res.notFound();

  if (record.content === content) return res.success();
  //if (record.user_id !== req.auth.userId) return res.unauthorized();

  if (await cache.hasJob("patch", name)) return res.conflict();
  if (await cache.hasJob("delete", name)) return res.conflict();
  cache.job("patch", name);

  const id = record.cloudflare_id;
  const proxy = record.proxy;
  console.log(id);

  await queue.add(
    "patch",
    { id, name, content, proxy },
    { id },
    defaultJobConfig,
  );

  res.status(200).json(req.body);
}


async function sync(req, res) {
  const content = req.headers["x-real-ip"];

  let actual_records = await db.getNamesByUserId(req.auth.userId);

  let requested_records = req.body.domains.sort(
    (a, b) => a.name.localeCompare(b.name)
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
      console.log('same contant and proxy');
      continue;
    }
    
    cache.job('patch', name);

    await queue.add(
      "patch",
      { id, name, content, proxy },
      { id },
      defaultJobConfig,
    );
  }

  const sync_session = randomBytes(32).toString("hex");
  req.body.sync_session = sync_session;

  req.body.ip = req.headers['x-real-ip'];
  cache.sync(sync_session, req.body);
  
  res.success({
    sync_session: sync_session,
  });
}

export default { post, remove, update, sync, jobStream };
