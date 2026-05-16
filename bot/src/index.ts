import { App } from "@slack/bolt";
import dotenv from "dotenv";
import loadTable, { setSentDMs } from "./airtable.js";

let app: App;
async function start() {
  dotenv.config({ quiet: true });
  if (!process.env.SLACK_BOT_TOKEN) throw new Error('"SLACK_BOT_TOKEN" environment variable is missing!');
  if (process.env.SOCKET_MODE === "true") {
    if (!process.env.SLACK_APP_TOKEN) throw new Error('"SLACK_APP_TOKEN" environment variable is missing (and Socket Mode is on)!');
    app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });
  } else {
    if (!process.env.SLACK_SIGNING_SECRET) throw new Error('"SLACK_SIGNING_SECRET" environment variable is missing (and Socket Mode is off)!');
    app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: false,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      port: Number.parseInt(process.env.PORT || "3000")
    });
  }
  await app.start();
  app.logger.setName("hc-mc-stickers");
  const selfInfo = await app.client.auth.test();
  app.logger.info(`is ready as ${selfInfo.user} (${selfInfo.user_id}) :D`);
  const table = await loadTable();
  console.log("airtable list (testing if this works meow):");
  for (const item of table) console.log(`${item.slackName} (${item.mcName}) - ${item.recordID}`);
}
start();
export function getApp() { return app; }