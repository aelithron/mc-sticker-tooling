import type { App } from "@slack/bolt";
import loadTable from "./airtable.js";

export async function sendDMs(app: App): Promise<{ sentTo: string[], errors: boolean }> {
  const entries = await loadTable();
  let sentTo: string[] = [];
  let errors = false;
  for (const entry of entries) {
    try {
      const dm = await app.client.conversations.open({ users: entry.slackID });
      await app.client.chat.postMessage({
        channel: dm.channel!.id!, icon_url: `https://mc-heads.net/head/${entry.mcName}/600`, username: `Minecraft Stickers (for ${entry.mcName})`,
        text: `Hey! You filled out the form to get free stickers from the Hack Club Minecraft server (on ${new Date(entry.createdAt).toDateString()}), and we're almost ready to mail them to you :3\nTo make sure they arrive correctly, please confirm or update the following details:\n- Address: [redacted], ${entry.address.city}, ${entry.address.state}, ${entry.address.country}, ${entry.address.zip}\nName on envelope: ${entry.address.name || entry.slackName}\nIf you don't want to be mailed stickers anymore, you can cancel them with the button below. If you don't click any of these buttons, you will still be mailed stickers, however it will take a bit longer (for the first few weeks, we're only shipping to people who have confirmed or edited their info, to give people time to correct it if they need).\nHave any questions? Please send a message in <#CD1JSG9UK>, or DM <@${process.env.OWNER_ID || "U08RJ1PEM7X"}>.`,
        blocks: [
          {
            type: "rich_text",
            elements: [
              {
                type: "rich_text_section", elements: [
                  { type: "text", text: "Hey! You filled out the form to get free stickers from the Hack Club " },
                  { type: "channel", channel_id: "CD1JSG9UK" },
                  { type: "text", text: ` server (on ${new Date(entry.createdAt).toDateString()}), and we're almost ready to mail them to you :3\nTo make sure they arrive correctly, please confirm or update the following details:\n` }
                ]
              },
              {
                type: "rich_text_list", style: "bullet", indent: 0, border: 0, elements: [
                  {
                    type: "rich_text_section",
                    elements: [
                      { type: "text", text: "Address: " },
                      { type: "text", text: "[redacted]", style: { code: true } },
                      { type: "text", text: `, ${entry.address.city}, ${entry.address.state}, ${entry.address.country}, ${entry.address.zip}` }
                    ]
                  },
                  { type: "rich_text_section", elements: [{ type: "text", text: `Name on envelope: ${entry.address.name || entry.slackName}` }] }
                ]
              },
              {
                type: "rich_text_section",
                elements: [
                  { type: "text", text: "\nIf you don't want to be mailed stickers anymore, you can cancel them with the button below. If you don't click any of these buttons, you will still be mailed stickers, however it will take a bit longer (for the first few weeks, we're only shipping to people who have confirmed or edited their info, to give people time to correct it if they need).\n\nHave any questions? Please send a message in " },
                  { type: "channel", channel_id: "CD1JSG9UK" },
                  { type: "text", text: " or DM " },
                  { type: "user", user_id: (process.env.OWNER_ID || "U08RJ1PEM7X") },
                  { type: "text", text: "." }
                ]
              }
            ]
          },
          {
            type: "actions",
            elements: [
              { type: "button", text: { type: "plain_text", text: ":white_check_mark: Confirm", emoji: true }, style: "primary", value: entry.recordID, action_id: "hcmc-confirm" },
              { type: "button", text: { type: "plain_text", text: ":pencil: Edit", emoji: true }, value: entry.recordID, action_id: "hcmc-edit" },
              { type: "button", text: { type: "plain_text", text: ":x: Cancel Stickers", emoji: true }, style: "danger", value: entry.recordID, action_id: "hcmc-cancel" }
            ]
          }
        ]
      });
      sentTo.push(entry.recordID);
    } catch (e) {
      errors = true;
      console.error(`Slack Error - Couldn't DM user ${entry.slackID} (record ${entry.recordID})\n${e}`);
      continue;
    }
  }
  return { sentTo, errors };
}