import { Letter } from "@/fulfiller";
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
    await table.update(recordID, { "Approval": status, "Fulfilled": fulfilled });
    return true;
  } catch (e) {
    console.error(`Airtable Error - Couldn't change status for ${recordID} to ${status}\n${e}`);
    return false;
  }
}