import type { 
  DeletionContent,
  PatchContent,
  PostContent
} from '../types/entries.js';
import Cloudflare from "cloudflare";

type RecordBatchParams = Parameters<typeof client.dns.records.batch>[0];

if (!process.env.CF_EMAIL || !process.env.CF_KEY || !process.env.CF_ZONE_ID) {
  throw new Error('Cloudflare credentials missing');
}

const client = new Cloudflare({
  apiEmail: process.env.CF_EMAIL,
  apiKey: process.env.CF_KEY
});

const ZONE_ID = process.env.CF_ZONE_ID;

const MAX_BATCH_LEN = 150;
const MAX_BATCH_TIME = 300;

export class Batch {
  private len: number;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isDispatching: boolean = false;
  private payload: {
    zone_id: string;
    deletes: DeletionContent[];
    patches: PatchContent[];
    posts: PostContent[];
  };

  private resolvers: {
    deletes: Array<(value: any) => void>,
    patches: Array<(value: any) => void>,
    posts: Array<(value: any) => void>,
  };

  constructor() {
    this.len = 0;
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
    this.clearDispatchTimer();
    this.len = 0;

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

  private scheduleDispatch(): void {
    if (this.timer !== null) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.dispatch();
    }, MAX_BATCH_TIME)
  }

  private clearDispatchTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private async untilSpace(): Promise<void> {
    while (this.len >= MAX_BATCH_LEN) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  async delete(data: DeletionContent ): Promise<any> {
    await this.untilSpace();
    this.scheduleDispatch();
    return new Promise<any>((resolve) => {
      this.payload.deletes.push(data);
      this.resolvers.deletes.push(resolve);
      this.len++;
    });
  }

  async patch(data: PatchContent) {
    await this.untilSpace();
    this.scheduleDispatch();
    return new Promise<any>((resolve) => {
      this.payload.patches.push(data);
      this.resolvers.patches.push(resolve);
      this.len++;
    });
  }

  async post(data: PostContent) {
    await this.untilSpace();
    this.scheduleDispatch();
    return new Promise<any>((resolve) => {
      this.payload.posts.push(data);
      this.resolvers.posts.push(resolve);
      this.len++;
    });
  }

  async dispatch() {
    if (this.isDispatching) return;
    if (this.len === 0) {
      this.reset();
      return;
    }

    this.isDispatching = true;
    this.clearDispatchTimer();

    const payload = { ...this.payload };
    const resolvers = { ...this.resolvers };
    const payload_length = this.len;

    this.reset();

    try {
      const response  = await client.dns.records.batch(payload as RecordBatchParams);
      console.log(`DISPATCHED ${payload_length}`);
      console.log(response);

      const deleteResult = response.deletes ?? [];
      const patchResult = response.patches ?? [];
      const postResult = response.posts ?? [];

      deleteResult.forEach((res, i) => {
        if (resolvers.deletes[i]) resolvers.deletes[i](res);
      });
      patchResult.forEach((res, i) => {
        if (resolvers.patches[i]) resolvers.patches[i](res)
      });
      postResult.forEach((res, i) => {
       if (resolvers.posts[i]) resolvers.posts[i](res)
      });

    } catch (err) {
      console.log(err);
      [
        ...resolvers.deletes,
        ...resolvers.patches,
        ...resolvers.posts,
      ].forEach((resolve) => resolve(1));
    }
    finally {
      this.isDispatching = false;
    }
  }
}

export default { Batch };
