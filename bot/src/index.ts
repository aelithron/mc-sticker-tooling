import { App } from "@slack/bolt";
import dotenv from "dotenv";
import { sendDMs } from "./dms.js";
import { getEntry, setSentDMs, updateAddress, updateStatus } from "./airtable.js";
import createForm from "./forms.js";
import type { AddressEdit } from "../bot.js";

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
    await setSentDMs(dms.sentTo);
  });
  app.action("hcmc-confirm", async ({ ack, action, body, client }) => {
    ack();
    if (action.type !== "button" || body.type !== "block_actions") return;
    if (!action.value) {
      app.logger.error(`Action ${body.actions[0]?.action_id} didn't pass a value (when it should have given an Airtable record ID)!`);
      return;
    }
    const entry = await getEntry(action.value);
    if (entry.slackID !== body.user.id) {
      await client.chat.postEphemeral({ channel: body.channel!.id!, user: body.user.id, text: `you aren't who this button is meant for! :sillybleh:\nif you didn't get this by messing around with the slack api, please DM <@${process.env.OWNER_ID || "U08RJ1PEM7X"}> and provide the ID ${action.value}.` });
      return;
    }
    if (entry.approval !== "Approved") {
      await client.chat.postEphemeral({ channel: body.channel!.id!, user: body.user.id, text: `Your sticker request isn't able to be edited right now! If you still need to make changes, please message <@${process.env.OWNER_ID || "U08RJ1PEM7X"}>.` });
      return;
    }
    await updateStatus(entry.recordID, "Confirmed");
    const blocks: any[] = (body.message!.blocks as { type: string }[]).filter((block) => block.type !== "actions");
    blocks.push({ type: "divider" });
    blocks.push({
      type: "rich_text", elements: [{
        type: "rich_text_section",
        elements: [
          { type: "text", text: "Status", style: { bold: true } },
          { type: "text", text: ": " },
          { type: "emoji", name: "white_check_mark", unicode: "2705" },
          { type: "text", text: " Confirmed   |   If you still need to make changes, please DM " },
          { type: "user", user_id: "U08RJ1PEM7X" },
          { type: "text", text: "." }
        ]
      }]
    });
    await client.chat.update({ channel: body.channel!.id, ts: body.message!.ts, blocks });
    await client.chat.postEphemeral({ channel: body.channel!.id!, user: body.user.id!, text: `Thanks! Your address and name have been confirmed, and your stickers will be mailed soon.\nIf you need to make any more changes, please message <@${process.env.OWNER_ID || "U08RJ1PEM7X"}>.` });
  });
  app.action("hcmc-edit", async ({ ack, action, body, client }) => {
    ack();
    if (action.type !== "button" || body.type !== "block_actions") return;
    if (!action.value) {
      app.logger.error(`Action ${body.actions[0]?.action_id} didn't pass a value (when it should have given an Airtable record ID)!`);
      return;
    }
    const entry = await getEntry(action.value);
    if (entry.slackID !== body.user.id) {
      await client.chat.postEphemeral({ channel: body.channel!.id!, user: body.user.id!, text: `you aren't who this button is meant for! :sillybleh:\nif you didn't get this by messing around with the slack api, please DM <@${process.env.OWNER_ID || "U08RJ1PEM7X"}> and provide the ID ${action.value}.` });
      return;
    }
    if (entry.approval !== "Approved") {
      await client.chat.postEphemeral({ channel: body.channel!.id!, user: body.user.id, text: `Your sticker request isn't able to be edited right now! If you still need to make changes, please message <@${process.env.OWNER_ID || "U08RJ1PEM7X"}>.` });
      return;
    }
    await client.views.open({ trigger_id: body.trigger_id, view: createForm(entry, body.channel!.id, body.message!.ts) });
  });
  app.action("hcmc-cancel", async ({ ack, action, body, client }) => {
    ack();
    if (action.type !== "button" || body.type !== "block_actions") return;
    if (!action.value) {
      app.logger.error(`Action ${body.actions[0]?.action_id} didn't pass a value (when it should have given an Airtable record ID)!`);
      return;
    }
    const entry = await getEntry(action.value);
    if (entry.slackID !== body.user.id) {
      await client.chat.postEphemeral({ channel: body.channel!.id!, user: body.user.id!, text: `you aren't who this button is meant for! :sillybleh:\nif you didn't get this by messing around with the slack api, please DM <@${process.env.OWNER_ID || "U08RJ1PEM7X"}> and provide the ID ${action.value}.` });
      return;
    }
    if (entry.approval !== "Approved") {
      await client.chat.postEphemeral({ channel: body.channel!.id!, user: body.user.id, text: `Your sticker request isn't able to be edited right now! If you still need to make changes, please message <@${process.env.OWNER_ID || "U08RJ1PEM7X"}>.` });
      return;
    }
    await updateStatus(entry.recordID, "Cancelled");
    const blocks: any[] = (body.message!.blocks as { type: string }[]).filter((block) => block.type !== "actions");
    blocks.push({ type: "divider" });
    blocks.push({
      type: "rich_text", elements: [{
        type: "rich_text_section",
        elements: [
          { type: "text", text: "Status", style: { bold: true } },
          { type: "text", text: ": " },
          { type: "emoji", name: "x", unicode: "274c" },
          { type: "text", text: " Cancelled   |   If you still need to make changes, please DM " },
          { type: "user", user_id: "U08RJ1PEM7X" },
          { type: "text", text: "." }
        ]
      }]
    });
    await client.chat.update({ channel: body.channel!.id, ts: body.message!.ts, blocks });
    await client.chat.postEphemeral({ channel: body.channel!.id!, user: body.user.id!, text: `Thanks! Your sticker request has been cancelled, and you won't be mailed stickers.\nIf this was done in error, please message <@${process.env.OWNER_ID || "U08RJ1PEM7X"}> to restore your request.` });
  });
  app.view("hcmc-address-update", async ({ ack, body, client, view }) => {
    ack();
    const data: { recordID: string, channelID: string, messageTs: string } = JSON.parse(view.private_metadata);
    if (!data.channelID || !data.recordID || !data.messageTs) {
      app.logger.error(`View ${view.callback_id} didn't pass the correct values!`);
      return;
    }
    const entry = await getEntry(data.recordID);
    if (body.user.id !== entry.slackID) {
      await client.chat.postEphemeral({ channel: data.channelID, user: body.user.id, text: `you aren't who this form is meant for! :sillybleh:\nif you didn't get this by messing around with the slack api, please DM <@${process.env.OWNER_ID || "U08RJ1PEM7X"}> and provide the ID ${data.recordID}.` });
      return;
    }
    if (entry.approval !== "Approved") {
      await client.chat.postEphemeral({ channel: data.channelID, user: body.user.id, text: `Your sticker request isn't able to be edited right now! If you still need to make changes, please message <@${process.env.OWNER_ID || "U08RJ1PEM7X"}>.` });
      return;
    }
    const address: AddressEdit = {
      street: view.state.values.street!.street_input!.value || undefined,
      city: view.state.values.city!.city_input!.value || undefined,
      state: view.state.values.state!.state_input!.value || undefined,
      zip: view.state.values.zip!.zip_input!.value || undefined,
      name: view.state.values.name!.name_input!.value || undefined
    }
    await updateAddress(entry.recordID, address);
    await updateStatus(entry.recordID, "Confirmed");
    const message = await client.conversations.history({ channel: data.channelID, latest: data.messageTs, inclusive: true, limit: 1 });
    const blocks: any[] = (message.messages![0]?.blocks as { type: string }[]).filter((block) => block.type !== "actions");
    blocks.push({ type: "divider" });
    blocks.push({
      type: "rich_text", elements: [{
        type: "rich_text_section",
        elements: [
          { type: "text", text: "Status", style: { bold: true } },
          { type: "text", text: ": " },
          { type: "emoji", name: "white_check_mark", unicode: "2705" },
          { type: "text", text: " Confirmed (with edits)   |   If you still need to make changes, please DM " },
          { type: "user", user_id: "U08RJ1PEM7X" },
          { type: "text", text: "." }
        ]
      }]
    });
    blocks.push({
      type: "rich_text", elements: [{
        type: "rich_text_section",
        elements: [
          { type: "text", text: "Edits Made", style: { bold: true } },
          { type: "text", text: ":\n" },
        ]
      },
      {
        type: "rich_text_list", style: "bullet", indent: 0, border: 0, elements: [
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "Address: " },
              { type: "text", text: "[redacted]", style: { code: true } },
              { type: "text", text: `, ${address.city || entry.address.city}, ${address.state || entry.address.state}, ${entry.address.country}, ${address.zip || entry.address.zip}` }
            ]
          },
          { type: "rich_text_section", elements: [{ type: "text", text: `Name on envelope: ${address.name || (entry.address.name || entry.slackName)}` }] }
        ]
      }]
    });
    await client.chat.update({ channel: data.channelID, ts: data.messageTs, blocks });
    await client.chat.postEphemeral({ channel: data.channelID, user: body.user.id, text: `Thanks! Your details have been updated, and your stickers will be mailed soon.\nIf you need to make any more changes, please message <@${process.env.OWNER_ID || "U08RJ1PEM7X"}>.` });
  });
}
start();
export function getApp() { return app; }