export type Letter = {
  recordID: string;
  approval: "Approved" | "Confirmed" | "Flagged" | "Pending";
  slackID: string;
  mcName: string;
  createdAt: Date;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    name: string;
  }
}