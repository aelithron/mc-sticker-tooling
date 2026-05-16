import Airtable from "airtable";
import type { Entry } from "../bot.js";

export default async function loadTable(): Promise<Entry[]> {
  const table = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || "" }).base(process.env.AIRTABLE_BASE_ID || "").table(process.env.AIRTABLE_TABLE_ID || "");
  const res = table.select({ filterByFormula: "{Approval}='Approved'" });
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