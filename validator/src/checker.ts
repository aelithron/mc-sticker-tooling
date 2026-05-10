import type { DedupeCache, Entry, Verdict } from "../validator.js";
export default async function check(entry: Entry, caches: { airtable: DedupeCache[] }): Promise<Verdict> {
  const errors: string[] = [];
  const filteredCache = caches.airtable.filter((item) => entry.recordID !== item.recordID)
  if (filteredCache.find((item) => item.mcName === entry.mcName)) errors.push(`This record shares a Minecraft username with "${filteredCache.find((item) => item.mcName === entry.mcName)?.recordID}", likely duplicate!`);
  if (filteredCache.find((item) => item.slackID === entry.slackID)) errors.push(`This record shares a Slack ID with "${filteredCache.find((item) => item.slackID === entry.slackID)?.recordID}", likely duplicate!`);
  if (!entry.mcName.startsWith(".")) {
    let mojangAPI;
    try {
      mojangAPI = await fetch(`https://api.mojang.com/users/profiles/minecraft/${entry.mcName}`);
    } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Mojang API:\n${e}`); }
    if (!mojangAPI.ok || (await mojangAPI.json()).errorMessage) errors.push(`Minecraft username "${entry.mcName}" doesn't exist!`);
  } else {
    let geyserAPI;
    try {
      geyserAPI = await fetch(`https://api.geysermc.org/v2/xbox/xuid/${entry.mcName.split(".")[1]}`);
    } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Geyser API:\n${e}`); }
    if (!geyserAPI.ok || (await geyserAPI.json()).errorMessage) errors.push(`Minecraft username "${entry.mcName}" (Bedrock) doesn't exist!`);
  }
  return { approved: (errors.length === 0), errors }
}