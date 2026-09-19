import { DedupeCache, Letter, Verdict } from "@/fulfiller";
import Airtable from "airtable";

export default async function loadTable(mode: "letter" | "validator"): Promise<Letter[]> {
  let formula;
  if (mode === "letter") {
    formula = "AND(OR({Approval}='Approved', {Approval}='Confirmed'), {Fulfilled} = 0)";
  }
  if (mode === "validator") {
    formula = "AND(OR({Approval}='Pending', {Approval}='Flagged'), {Fulfilled} = 0)";
  }
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  const res = table.select({ filterByFormula: formula });
  const entries: Letter[] = [];
  return new Promise((resolve, reject) => {
    res.eachPage((records, fetchNextPage) => {
      for (const item of records) {
        entries.push({
          recordID: item.id,
          approval: item.get("Approval") as "Approved" | "Confirmed" | "Pending" | "Flagged",
          address: {
            street: item.get("Street Address") as string,
            city: item.get("City") as string,
            state: item.get("State") as string,
            country: item.get("Country") as string,
            zip: item.get("Zip Code") as string,
            name: (item.get("Mailing Name") !== undefined ? item.get("Mailing Name") as string : item.get("Slack Username") as string)
          },
          slackID: item.get("Slack ID") as string,
          mcName: item.get("Minecraft username") as string,
          slackName: item.get("Slack Username") as string,
          createdAt: new Date(item.get("Created") as string)
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
export async function getLetter(recordID: string): Promise<Letter> {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  try {
    const item = await table.find(recordID);
    return {
      recordID: item.id,
      approval: item.get("Approval") as "Approved" | "Confirmed" | "Pending" | "Flagged",
      address: {
        street: item.get("Street Address") as string,
        city: item.get("City") as string,
        state: item.get("State") as string,
        country: item.get("Country") as string,
        zip: item.get("Zip Code") as string,
        name: (item.get("Mailing Name") !== undefined ? item.get("Mailing Name") as string : item.get("Slack Username") as string)
      },
      slackID: item.get("Slack ID") as string,
      slackName: item.get("Slack Username") as string,
      mcName: item.get("Minecraft username") as string,
      createdAt: new Date(item.get("Created") as string)
    }
  } catch (e) {
    throw new Error(`Airtable Error - Couldn't find record ${recordID}\n${e}`);
  }
}
export async function updateStatus(recordID: string, { status, fulfilled }: { status: "Approved" | "Confirmed" | "Pending" | "Flagged" | undefined, fulfilled: boolean | undefined }) {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  try {
    const update: { "Approval"?: string, "Fulfilled"?: boolean } = {};
    if (status) update.Approval = status;
    if (fulfilled !== undefined) update.Fulfilled = fulfilled;
    await table.update(recordID, update);
    return true;
  } catch (e) {
    console.error(`Airtable Error - Couldn't change status for ${recordID} to ${status}\n${e}`);
    return false;
  }
}
export async function loadValidatorCaches(): Promise<{ airtable: DedupeCache[] }> {
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
    for (const error of verdict.errors) console.log(`- ${error}`);
  }
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  table.update(recordID, { "Approval": (verdict.approved ? "Approved" : "Flagged") });
  if (!verdict.approved) {
    try {
      await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}/${recordID}/comments`, { method: "POST", headers: { "Authorization": `Bearer ${process.env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ text: `[script] Errors:\n${verdict.errors.join("\n")}` }) });
    } catch (e) {
      throw new Error(`Error on Record ${recordID} - Airtable API:\n${e}`);
    }
  }
}
export async function correctEntry(entry: Letter) {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  let slackAPI;
  try {
    slackAPI = await fetch(`https://slack.com/api/users.info?user=${entry.slackID}`, { headers: { "Authorization": `Bearer ${process.env.SLACK_BOT_TOKEN}` } });
  } catch (e) { throw new Error(`Error on Record ${entry.recordID} - Slack API:\n${e}`); }
  const slackBody = await slackAPI.json();
  if (!slackAPI.ok || slackBody.error) throw new Error(`Error on Record ${entry.recordID} - Slack API:\n${slackBody.error || `Unknown error - HTTP ${slackAPI.status}`}`);
  table.update(entry.recordID, { "Slack Username": (slackBody.user.profile.display_name !== "" ? slackBody.user.profile.display_name : slackBody.user.profile.real_name) });
  console.log(`Corrected Record ${entry.recordID}! (Slack Username: ${entry.slackName} -> ${slackBody.user.profile.display_name !== "" ? slackBody.user.profile.display_name : slackBody.user.profile.real_name})`);
}