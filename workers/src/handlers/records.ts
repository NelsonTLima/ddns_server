import type { Job } from "bullmq";
import { Batch } from "#cloudflare/batch.js";
import { Deletion, Patch, Post  } from "#cloudflare/entries.js";
import cache from "@ddns/internal/queries/cache";
import db from "@ddns/internal/queries/db";

const batch = new Batch();


export async function handleDeletion(job: Job) {
  const { id, name } = job.data;
  console.log(`Deleting ${name}`);
  const deletion = new Deletion(id, name);
  const result = await batch.delete(deletion.content);

  if (result === 1) throw new Error("Batch failed.");
  cache.delJob("delete", name);
  db.deleteRecordById(id);
}


export async function handlePatch(job: Job) {
  if (!job) throw new Error("Job is required at handlePatch");
  const { id, name, content, proxy } = job.data;
  console.log(`Patching ${name}`);
  const patch = new Patch(id, name, content, proxy);
  console.log(patch);
  const result = await batch.patch(patch.content);
  if (result === 1) throw new Error("Batch failed.");

  cache.delJob("patch", name);
  db.changeRecordContent(id, content);
}


export async function handlePost(job: Job) {
  const { user_id, username, name, content, proxy } = job.data;

  console.log(
    `${username} requested posting ${name} ${content} proxy ${proxy}`,
  );

  const post = new Post(name, content, proxy);
  const result  = await batch.post(post.content);

  if (result === 1) throw new Error("Batch failed.");

  cache.delJob("post", name);

  db.insertPostRecord(
    user_id,
    result.id,
    name,
    content,
    proxy,
    result.created_on,
    result.modified_on,
  );
}
