import Airtable from "airtable";
import type { DedupeCache, Entry, Verdict } from "../validator.js";

export default async function loadTable(): Promise<Entry[]> {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  const res = table.select({ filterByFormula: "{Approval}='Pending'" });
  const entries: Entry[] = [];
  return new Promise((resolve, reject) => {
    res.eachPage((records, fetchNextPage) => {
      for (const item of records) {
        entries.push({
          recordID: item.id,
          slackID: item.get("Slack ID") as string,
          mcName: item.get("Minecraft username") as string,
          slackName: item.get("Slack Username") as string,
          createdAt: new Date(item.get("Created") as string),
          address: {
            street: item.get("Street Address") as string,
            city: item.get("City") as string,
            state: item.get("State") as string,
            country: item.get("Country") as string,
            zip: item.get("Zip Code") as string
          }
        });
      }
      fetchNextPage();
    }, function done(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(entries);
    });
  });
}
export async function loadCaches(): Promise<{ airtable: DedupeCache[] }> {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  const res = table.select({ fields: ["Slack ID", "Minecraft username"] });
  const dedupeCache: DedupeCache[] = await new Promise((resolve, reject) => {
    const airtableCache: DedupeCache[] = [];
    res.eachPage((records, fetchNextPage) => {
      for (const item of records) {
        airtableCache.push({
          recordID: item.id,
          slackID: item.get("Slack ID") as string,
          mcName: item.get("Minecraft username") as string
        });
      }
      fetchNextPage();
    }, function done(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(airtableCache);
    });
  });
  return { airtable: dedupeCache }
}
export async function enterVerdict(recordID: string, verdict: Verdict) {
  if (verdict.approved) {
    console.log(`${recordID} - Approved`);
  } else {
    console.log(`${recordID} - Flagged (${verdict.errors.length} Error${verdict.errors.length !== 1 ? "s" : ""})`);
  }
  /*
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  table.update(recordID, { "Approval": (verdict.approved ? "Approved" : "Flagged") });
  if (!verdict.approved) {
    try {
      await fetch(`https://airtable.com/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}/${recordID}/comments`, { method: "POST", headers: { "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}` }, body: JSON.stringify({ text: `[script] Errors:\n${verdict.errors.join("\n")}` }) });
    } catch (e) {
      throw new Error(`Error on Record ${entry.recordID} - Airtable API:\n${e}`);
    }
  }
  */
}
export async function correctEntry(entry: Entry) {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  let slackAPI;
  try {
    slackAPI = await fetch(`https://slack.com/api/users.info?user=${entry.slackID}`, { headers: { "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}` } });
  } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Slack API:\n${e}`); }
  const slackBody = await slackAPI.json();
  if (!slackAPI.ok || slackBody.error) throw new Error(`Error on Record ${entry.recordID} - Slack API:\n${slackBody.error || `Unknown error - HTTP ${slackAPI.status}`}`);
  //table.update(entry.recordID, { "Slack Username": (slackBody.user.profile.display_name !== "" ? slackBody.user.profile.display_name : slackBody.user.profile.real_name) });
  console.log(`Corrected Record ${entry.recordID}! (Slack Username: ${entry.slackName} -> ${slackBody.user.profile.display_name !== "" ? slackBody.user.profile.display_name : slackBody.user.profile.real_name})`);
}