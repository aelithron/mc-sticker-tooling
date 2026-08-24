# HC Minecraft Sticker Tooling ![IMG](https://hackatime-badge.hackclub.com/U08RJ1PEM7X/mc-sticker-tooling)
My assorted work to make a cool pipeline for fulfilling the free stickers people get for finding diamonds on the Hack Club Minecraft server!
## Parts
This is a monorepo, so the code is split into a few parts!
### Fulfiller ([`/fulfiller`](https://github.com/aelithron/mc-sticker-tooling/tree/main/fulfiller))
A web panel that shows sticker envelopes written out (showing the address, name, stamp, return address, and any needed markings for the envelope)! Also includes a function to run the validator script.
### Bot ([`/bot`](https://github.com/aelithron/mc-sticker-tooling/tree/main/bot))
A Slack bot that sends confirmation DMs to people with pending sticker requests, mainly developed to allow people to change their address on sticker requests that were made a long time ago. \
Context: The MC admin team stopped fulfilling stickers for like three years, and a ton of people had years-old sticker requests, so I developed a bot that allows them to self-correct the envelope info! I also use it because we didn't collect preferred names for the envelope, so this allows putting one of those too!
### Validator Plugin ([`/plugin`](https://github.com/aelithron/mc-sticker-tooling/tree/main/plugin))
A plugin that runs on the Minecraft server to check if people have the achievement they need to get stickers! The form link is sent once you find diamonds on the Hack Club Minecraft server, so this allows the validator to check if a given account (UUID) has.
### [legacy] Validator ([`/validator`](https://github.com/aelithron/mc-sticker-tooling/tree/main/validator))
The old validation script! This logic is re-implemented in a better way in the fulfiller, but remains here to show the incremental progress I made on it! \
It's also still useful for bulk checking without opening a whole browser and having a deployed fulfiller instance.