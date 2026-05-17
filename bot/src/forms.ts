import type { Entry } from "../bot.js";
import type { ModalView } from "@slack/types";

export default function createForm(entry: Entry, channelID: string, messageTs: string): ModalView {
  const modal: ModalView = {
    type: "modal",
    callback_id: "hcmc-address-update",
    private_metadata: JSON.stringify({ recordID: entry.recordID, channelID, messageTs }),
    title: { type: "plain_text", text: "Update Info" },
    submit: { type: "plain_text", text: "Confirm" },
    blocks: [
      { type: "input", block_id: "street", element: { type: "plain_text_input", action_id: "street_input" }, label: { type: "plain_text", text: "Street Address", emoji: true }, optional: true },
      { type: "input", block_id: "city", element: { type: "plain_text_input", action_id: "city_input" }, label: { type: "plain_text", text: "City", emoji: true }, hint: { type: "plain_text", text: `Currently: ${entry.address.city}` }, optional: true },
      { type: "input", block_id: "state", element: { type: "plain_text_input", action_id: "state_input" }, label: { type: "plain_text", text: "State", emoji: true }, hint: { type: "plain_text", text: `Currently: ${entry.address.state}` }, optional: true },
      { type: "section", text: { type: "mrkdwn", text: `*Country*\n${entry.address.country}` } },
      { type: "context", elements: [{ type: 'mrkdwn', text: `You can't change your country here!\nPlease DM <@${process.env.OWNER_ID || "U08RJ1PEM7X"}> if you need to change it.` }]},
      { type: "input", block_id: "zip", element: { type: "plain_text_input", action_id: "zip_input" }, label: { type: "plain_text", text: "Zip Code", emoji: true }, hint: { type: "plain_text", text: `Currently: ${entry.address.zip}` }, optional: true },
      { type: "input", block_id: "name", element: { type: "plain_text_input", action_id: "name_input" }, label: { type: "plain_text", text: "Name on Envelope", emoji: true }, hint: { type: "plain_text", text: `Currently: ${entry.address.name || entry.slackName}` }, optional: true }
    ]
  }
  return modal;
}