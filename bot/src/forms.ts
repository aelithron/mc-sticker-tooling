import type { Entry } from "../bot.js";
import type { ModalView } from "@slack/types";

export default function createForm(entry: Entry): ModalView {
  const modal: ModalView = {
    type: "modal",
    callback_id: "hcmc-address-update",
    private_metadata: entry.recordID,
    title: { type: "plain_text", text: "Update Info" },
    submit: { type: "plain_text", text: "Confirm" },
    blocks: []
  }
  return modal;
}