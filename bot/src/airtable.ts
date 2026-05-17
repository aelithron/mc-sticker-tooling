import Airtable from "airtable";
import type { AddressEdit, Entry } from "../bot.js";

export default async function loadTable(): Promise<Entry[]> {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  const res = table.select({ filterByFormula: "AND({Approval}='Approved', {Fulfilled}=0, {Sent DM}=0)" });
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
          approval: item.get("Approval") as string,
          address: {
            street: item.get("Street Address") as string,
            city: item.get("City") as string,
            state: item.get("State") as string,
            country: item.get("Country") as string,
            zip: item.get("Zip Code") as string,
            name: item.get("Mailing Name") as string
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
export async function getEntry(recordID: string): Promise<Entry> {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  try {
    const item = await table.find(recordID);
    return {
      recordID: item.id,
      slackID: item.get("Slack ID") as string,
      mcName: item.get("Minecraft username") as string,
      slackName: item.get("Slack Username") as string,
      createdAt: new Date(item.get("Created") as string),
      approval: item.get("Approval") as string,
      address: {
        street: item.get("Street Address") as string,
        city: item.get("City") as string,
        state: item.get("State") as string,
        country: item.get("Country") as string,
        zip: item.get("Zip Code") as string,
        name: item.get("Mailing Name") as string
      }
    }
  } catch (e) {
    throw new Error(`Airtable Error - Couldn't find record ${recordID}\n${e}`);
  }
}
export async function setSentDMs(records: string[]) {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    try {
      await table.update(batch.map(id => ({ id, fields: { "Sent DM": true } })));
    } catch (e) {
      console.error(`Airtable Error - Couldn't mark some records as having been sent DMs, please do these manually!\nRecord IDs: ${batch}\n${e}`);
      continue;
    }
  }
}
export async function updateAddress(recordID: string, address: AddressEdit): Promise<boolean> {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  try {
    await table.update(recordID, {
      "Street Address": address.street,
      "City": address.city,
      "State": address.state,
      "Zip Code": address.zip,
      "Mailing Name": address.name
    });
    return true;
  } catch (e) {
    console.error(`Airtable Error - Couldn't update address for ${recordID}\n${e}`);
    return false;
  }
}
export async function updateStatus(recordID: string, status: "Confirmed" | "Cancelled") {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  try {
    await table.update(recordID, { "Approval": status });
    return true;
  } catch (e) {
    console.error(`Airtable Error - Couldn't change status for ${recordID} to ${status}\n${e}`);
    return false;
  }
}