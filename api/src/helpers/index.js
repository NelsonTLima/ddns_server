export function filterUpdates(domains, records) {
  const updates = [];

  let i = 0;
  let j = 0;
  while (domains.length > i && records.length > j) {
    if (domains[i].name == records[j].name) {
      let update = {
        id: records[j].cloudflare_id,
        name: records[j].name,
        oldProxy: records[j].proxied,
        proxy: domains[i].proxy,
        oldContent: records[j].content
      };
      updates.push(update);
      i++;
      j++;
    } else if (domains[i].name < records[j].name) {
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
