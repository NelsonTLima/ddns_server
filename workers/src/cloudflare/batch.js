// TODO: Create a pending queue.
import Cloudflare from "cloudflare";

const client = new Cloudflare({
  apiEmail: process.env.CF_EMAIL,
  apiKey: process.env.CF_KEY
});

const ZONE_ID = process.env.CF_ZONE_ID;

const MAX_BATCH_LEN = 150;
const MAX_BATCH_TIME = 300;

export class Batch {
  constructor() {
    this.len = 0;
    this.lock = false;
    this.timer = setTimeout(() => {
      this.lock = true;
      this.dispatch()
    }, MAX_BATCH_TIME);

    this.pending = [];

    this.payload = {
      zone_id: ZONE_ID,
      deletes: [],
      patches: [],
      posts: [],
    };

    this.resolvers = {
      deletes: [],
      patches: [],
      posts: [],
    };
  }

  reset() {
    this.len = 0;
    this.lock = false;
    this.timer = setTimeout(() => {
      this.lock = true;
      this.dispatch();
    }, MAX_BATCH_TIME);

    this.pending = [],

    this.payload = {
      zone_id: ZONE_ID,
      deletes: [],
      patches: [],
      posts: [],
    };

    this.resolvers = {
      deletes: [],
      patches: [],
      posts: [],
    };
  }

  delete(data) {
    return new Promise((resolve) => {
      this.payload.deletes.push(data);
      this.resolvers.deletes.push(resolve);
      this.len++;
      this.check();
    });
  }

  patch(data) {
    return new Promise((resolve) => {
      this.payload.patches.push(data);
      this.resolvers.patches.push(resolve);
      this.len++;
      this.check();
    });
  }

  post(data) {
    return new Promise((resolve) => {
      this.payload.posts.push(data);
      this.resolvers.posts.push(resolve);
      this.len++;
      this.check();
    });
  }

  check() {
    if (this.len >= MAX_BATCH_LEN) {
      this.lock = true;
      this.dispatch();
    }
  }

  async dispatch() {
    if (this.len === 0) {
      this.reset();
      return;
    }

    const payload = { ...this.payload };
    const resolvers = { ...this.resolvers };
    const payload_length = this.len;
    this.reset();

    try {
      const response = await client.dns.records.batch(payload);
      console.log(`DISPATCHED ${payload_length}`);

      const deleteResult = response.deletes ?? [];
      const patchResult = response.patches ?? [];
      const postResult = response.posts ?? [];

      deleteResult.forEach((res, i) => resolvers.deletes[i](res));
      patchResult.forEach((res, i) => resolvers.patches[i](res));
      postResult.forEach((res, i) => resolvers.posts[i](res));
    } catch (err) {
      console.log(err);
      [
        ...resolvers.deletes,
        ...resolvers.patches,
        ...resolvers.posts,
      ].forEach((resolve) => resolve(1));
    }
  }
}

export default { Batch };
