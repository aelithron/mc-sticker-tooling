export type Entry = {
  recordID: string,
  slackID: string,
  mcName: string,
  slackName: string,
  approval: string,
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
export type AddressEdit = {
  street: string | undefined,
  city: string | undefined,
  state: string | undefined,
  country: string | undefined,
  zip: string | undefined,
  name: string | undefined
}