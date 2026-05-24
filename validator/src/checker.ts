import { setTimeout } from "node:timers/promises";
import type { DedupeCache, Entry, Verdict } from "../validator.js";
export default async function check(entry: Entry, caches: { airtable: DedupeCache[] }): Promise<Verdict> {
  const errors: string[] = [];
  let correctionNeeded = false;
  const filteredCache = caches.airtable.filter((item) => entry.recordID !== item.recordID)
  if (filteredCache.find((item) => item.mcName === entry.mcName)) errors.push(`This record shares a Minecraft username with "${filteredCache.find((item) => item.mcName === entry.mcName)?.recordID}", likely duplicate!`);
  if (filteredCache.find((item) => item.slackID === entry.slackID)) errors.push(`This record shares a Slack ID with "${filteredCache.find((item) => item.slackID === entry.slackID)?.recordID}", likely duplicate!`);
  let uuid = null;
  if (entry.mcName) {
    if (!entry.mcName.startsWith(".")) {
      let mojangAPI;
      for (let i = 0; i < 3; i++) {
        try {
          mojangAPI = await fetch(`https://api.mojang.com/users/profiles/minecraft/${entry.mcName}`);
        } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Mojang API:\n${e}`); }
        if (mojangAPI.status === 429) {
          console.log("Pausing for Mojang API rate limit...");
          await setTimeout(5000);
          continue;
        }
        const mojangBody = await mojangAPI.json();
        if (!mojangAPI.ok || mojangBody.errorMessage) {
          if ((mojangBody.errorMessage as string).includes("Couldn't find any profile with name")) {
            errors.push(`Minecraft username "${entry.mcName}" doesn't exist!`);
          } else throw new Error(`Error on Record ${entry.recordID} - Mojang API:\n${mojangBody.errorMessage}`);
        } else uuid = (mojangBody.id as string).replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
        break;
      }
    } else {
      let geyserAPI;
      try {
        geyserAPI = await fetch(`https://api.geysermc.org/v2/xbox/xuid/${entry.mcName.split(".")[1]}`);
      } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Geyser API:\n${e}`); }
      const geyserBody = await geyserAPI.json();
      if (!geyserAPI.ok) {
        if ((geyserBody.message as string).includes("Unable to find user in our cache. Please try specifying their Floodgate UUID instead")) {
          errors.push(`Minecraft username "${entry.mcName}" (Bedrock) doesn't exist!`);
        } else throw new Error(`Error on Record ${entry.recordID} - Geyser API:\n${geyserBody.message}`);
      } else uuid = BigInt(geyserBody.xuid as string).toString(16).toUpperCase().replace(/^(.{4})(.{12})$/, "00000000-0000-0000-$1-$2");
    }
  } else errors.push("This record is missing a Minecraft username!");
  if (uuid && entry.createdAt.getTime() > 1762744410) { // nov 9 2025 was the new server's launch date, so i don't have data before it
    let stickerAPI;
    try {
      stickerAPI = await fetch(`${process.env.STICKERSRV_URL!}/check/${uuid}`, { headers: { "Authorization": `Bearer ${process.env.STICKERSRV_KEY}` } });
    } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Sticker Server API:\n${e}`); }
    const stickerBody = await stickerAPI.json();
    if (!stickerAPI.ok || stickerBody.error) throw new Error(`Error on Record ${entry.recordID} - Sticker Server API:\n${stickerBody.message} (${stickerBody.error})`);
    if (stickerBody.hasAdv === false) errors.push("This account hasn't found diamonds on the Hack Club MC server!");
  }
  let slackAPI;
  try {
    slackAPI = await fetch(`https://slack.com/api/users.info?user=${entry.slackID}`, { headers: { "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}` } });
  } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Slack API:\n${e}`); }
  const slackBody = await slackAPI.json();
  if (!slackAPI.ok || slackBody.error) {
    if (slackBody.error === "user_not_found") {
      errors.push(`Slack ID "${entry.slackID}" doesn't exist!`);
    } else throw new Error(`Error on Record ${entry.recordID} - Slack API:\n${slackBody.error}`);
  } else {
    if (entry.slackName !== (slackBody.user.profile.display_name !== "" ? slackBody.user.profile.display_name : slackBody.user.profile.real_name)) correctionNeeded = true;
  }
  return { approved: (errors.length === 0), errors, correctionNeeded }
}