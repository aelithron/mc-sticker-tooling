import { setTimeout } from "node:timers/promises";
import type { DedupeCache, Entry, Verdict } from "../validator.js";
export default async function check(entry: Entry, caches: { airtable: DedupeCache[] }): Promise<Verdict> {
  const errors: string[] = [];
  let correctionNeeded = false;
  const filteredCache = caches.airtable.filter((item) => entry.recordID !== item.recordID)
  if (filteredCache.find((item) => item.mcName === entry.mcName)) errors.push(`This record shares a Minecraft username with "${filteredCache.find((item) => item.mcName === entry.mcName)?.recordID}", likely duplicate!`);
  if (filteredCache.find((item) => item.slackID === entry.slackID)) errors.push(`This record shares a Slack ID with "${filteredCache.find((item) => item.slackID === entry.slackID)?.recordID}", likely duplicate!`);
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
        }
        break;
      }
    } else {
      let geyserAPI;
      try {
        geyserAPI = await fetch(`https://api.geysermc.org/v2/xbox/xuid/${entry.mcName.split(".")[1]}`);
      } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Geyser API:\n${e}`); }
      const geyserBody = await geyserAPI.json()
      if (!geyserAPI.ok) {
        if ((geyserBody.message as string).includes("Unable to find user in our cache. Please try specifying their Floodgate UUID instead")) {
          errors.push(`Minecraft username "${entry.mcName}" (Bedrock) doesn't exist!`);
        } else throw new Error(`Error on Record ${entry.recordID} - Geyser API:\n${geyserBody.message}`);
      }
    }
  } else errors.push("This record is missing a Minecraft username!");
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