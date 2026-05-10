export type Entry = {
  recordID: string,
  slackID: string,
  mcName: string,
  slackName: string,
  createdAt: Date,
  address: {
    street: string,
    city: string,
    state: string,
    country: string,
    zip: string
  }
}
export type Verdict = {
  approved: boolean,
  errors: string[],
  correctionNeeded: boolean
}
export type DedupeCache = {
  recordID: string,
  slackID: string,
  mcName: string
}