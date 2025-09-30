import type { ConfDomain, RecordView } from "../types/dns.ts";

type Update = {
  id: string;
  name: string;
  oldProxy: boolean;
  proxy: boolean
  oldContent: string;
}

export function filterUpdates(
  domains: Array<ConfDomain>,
  records: Array<RecordView>
): Update[] {
  const updates: Update[] = [];

  let i = 0;
  let j = 0;
  while (i < domains.length && j < records.length) {
    const di = domains[i]!;
    const rj = records[j]!;
    if (di.name == rj.name) {
      let update: Update = {
        id: rj.cloudflare_id,
        name: rj.name,
        oldProxy: rj.proxied,
        proxy: di.proxy,
        oldContent: rj.content
      };
      updates.push(update);
      i++;
      j++;
    } else if (di.name < rj.name) {
      i++;
    } else {
      j++;
    }
  }
  return updates
}

export default {
  filterUpdates
}
