import type { App } from "@slack/bolt";
import loadTable from "./airtable.js";

export async function sendDMs(app: App): Promise<{ sentTo: string[], errors: boolean }> {
  const entries = await loadTable();
  let sentTo: string[] = [];
  let errors = false;
  for (const entry of entries) {
    console.log(entry);
    try {
      await app.client.chat.postMessage({ channel: entry.slackID, markdown_text: "" });
      sentTo.push(entry.recordID);
    } catch (e) {
      errors = true;
      console.error(`Slack Error - Couldn't DM user ${entry.slackID} (record ${entry.recordID})\n${e}`);
      continue;
    }
  }
  return { sentTo, errors };
}