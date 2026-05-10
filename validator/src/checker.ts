import type { Entry, Verdict } from "../validator.js";
export default async function check(entry: Entry): Promise<Verdict> {
  const errors: string[] = [];
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