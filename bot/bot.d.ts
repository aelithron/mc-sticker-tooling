export type Entry = {
  recordID: string,
  slackID: string,
  mcName: string,
  slackName: string,
  createdAt: Date,
  address: Address
}
export type Address = {
  street: string,
  city: string,
  state: string,
  country: string,
  zip: string,
  name: string
}