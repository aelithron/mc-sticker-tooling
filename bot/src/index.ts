import { App } from "@slack/bolt";
import dotenv from "dotenv";
import { sendDMs } from "./dms.js";

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
  app.command("/send-sticker-dms", async ({ command, ack, client }) => {
    ack();
    if (command.user_id !== (process.env.OWNER_ID || "U08RJ1PEM7X")) {
      await client.chat.postEphemeral({ channel: command.channel_id, user: command.user_id, markdown_text: `you're not <@${process.env.OWNER_ID || "U08RJ1PEM7X"}>, silly! :sillybleh:\n(are you another minecraft admin? send a message in the admin channel about this)` });
      return;
    }
    const dms = await sendDMs(app);
    await client.chat.postEphemeral({ channel: command.channel_id, user: command.user_id, markdown_text: `done!~ DMs sent to ${dms.sentTo.length} ${dms.sentTo.length !== 1 ? "people" : "person"}!${dms.errors ? "\nthere was at least one error, please check the bot console!" : ""}` });
  });
}
start();
export function getApp() { return app; }