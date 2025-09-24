import { Batch } from "#cloudflare/batch.js";
import { Deletion, Patch, Post  } from "#cloudflare/entries.js";
import cache from "#queries/cache.js";
import db from "#queries/db.js";

const batch = new Batch();


export async function handleDeletion(job) {
  const { id, name } = job.data;
  console.log(`Deleting ${name}`);
  const deletion = new Deletion(id);
  const result = await batch.delete(deletion.content);

  if (result === 1) throw new Error("Batch failed.");
  console.log("passou do if");
  cache.delJob("delete", name);
  db.deleteRecordById(id);
}


export async function handlePatch(job) {
  const { id, name, content, proxy } = job.data;
  console.log(`Patching ${name}`);
  const patch = new Patch(id, content, proxy);
  console.log(patch);
  const result = await batch.patch(patch.content);
  if (result === 1) throw new Error("Batch failed.");

  cache.delJob("patch", name);
  db.changeRecordContent(id, content);
}


export async function handlePost(job) {
  const { userId, username, name, content, proxy } = job.data;

  console.log(
    `${username} requested posting ${name} ${content} proxy ${proxy}`,
  );

  const post = new Post(name, content, proxy);
  const result = await batch.post(post.content);

  if (result === 1) throw new Error("Batch failed.");

  cache.delJob("post", name);

  db.insertPostRecord(
    userId,
    result.id,
    name,
    content,
    proxy,
    result.created_on,
    result.modified_on,
  );
}
