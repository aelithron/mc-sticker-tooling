# HC Minecraft Sticker Tooling ![IMG](https://hackatime-badge.hackclub.com/U08RJ1PEM7X/mc-sticker-tooling)
My assorted work to make a cool pipeline for fulfilling the free stickers people get for finding diamonds on the Hack Club Minecraft server!
## Parts
This is a monorepo, so the code is split into a few parts!
### Web Panel ([`/panel`](https://github.com/aelithron/mc-sticker-tooling/tree/main/panel))
A web panel that shows sticker envelopes written out (showing the address, name, stamp, return address, and any needed markings for the envelope)! Also includes a function to run the validator script, as well as allowing you to override letter status.
### Bot ([`/bot`](https://github.com/aelithron/mc-sticker-tooling/tree/main/bot))
A Slack bot that sends confirmation DMs to people with pending sticker requests, mainly developed to allow people to change their address on sticker requests that were made a long time ago. \
Context: The MC admin team stopped fulfilling stickers for like three years, and a ton of people had years-old sticker requests, so I developed a bot that allows them to self-correct the envelope info! I also use it because we didn't collect preferred names for the envelope, so this allows putting one of those too!
### Plugin / StickerSRV ([`/plugin`](https://github.com/aelithron/mc-sticker-tooling/tree/main/plugin))
A plugin that runs on the Minecraft server to check if people have the achievement they need to get stickers! The form link is sent once you find diamonds on the Hack Club Minecraft server, so this allows the validator to check if a given account (UUID) has.
### [legacy] Validator ([`/validator`](https://github.com/aelithron/mc-sticker-tooling/tree/main/validator))
The old validation script! This logic is re-implemented in a better way in the fulfiller, but remains here to show the incremental progress I made on it! \
It's also still useful for bulk checking without opening a whole browser and having a deployed fulfiller instance.

## Evaluating
To test the project, follow these steps **IN THIS ORDER**:
1. Go to [the demo submission form](https://airtable.com/appMlXu7tUXSv10E8/pagOD037LwfKP8INJ/form) and fill it out **without using your real address**. Details entered into this form are essentially public, use a fake address like the ones supplied on the form (it provides the old HQ address and the American embassy in Canada, so you can use those to test both domestic and international addresses)!
2. Open [the demo panel](https://demostickers.novatea.dev). There, you can sign in with your HCA account (the demo instance is configured to allow any account). Click the button on your record to run the Validator (or the one to do it for all records), and wait around thirty seconds. Refresh the page, and your sticker request will be categorized into either Approved or Flagged. If the username you used hasn't found diamonds on the [Hack Club Minecraft server](https://hackclub.com/minecraft) before, the request will get flagged, which shows the StickerSRV plugin portion working! :3
3. Go over to Slack. Run the `/demo-send-sticker-dms` command, and you should get a DM from the `@(DEMO) Minecraft Stickers` bot. This will allow you to do one of the following:
  - Confirm your sticker request, which prioritizes it in the sending queue.
  - Edit your information (useful if you mistyped on the form) and confirm that info.
  - Cancel your request for stickers.
4. Head back to the demo panel, leave the validation page, and go to the sending page. Your request should appear first if you confirmed it on Slack, and the bar above the virtual envelope will show a checkmark in that case. You can swipe it left to flag it, or right to mark it as fulfilled. You can also undo the last action if you swiped in the wrong direction, or if you just swiped it too early. To "swipe" on desktop, hold your mouse cursor on the virtual envelope and slide your mouse in the correct direction for the action you want to take.

## Self-Hosting
I recommend running this in Docker, and only provide instructions for doing that!
### Environment Variables
You need quite a lot of keys to deploy this! I divided them into categories to make it a bit easier to get all of them <3
1. Airtable: Make sure you have cloned the demo base (or made your own), then go to [the developer portal](https://airtable.com/create/tokens/new). Create a new PAT with `data.records:read`, `data.records:write`, `data.recordComments:write`, and `schema.bases:read` permissions, setting the access to your "Minecraft Stickers" base. This key is your `AIRTABLE_API_KEY` variable! \
From there, get `AIRTABLE_BASE_ID` (which starts with "app") and `AIRTABLE_TABLE_ID` (which starts with "tbl") from your base's URL (open your base in your browser, then pull those values from the URL bar).
2. Slack: First, get your account's Slack user ID, and use this as the `OWNER_ID` environment variable. Create a Slack app in [the API portal](https://api.slack.com/apps). Create it "using a manifest", then upload [this manifest](https://github.com/aelithron/mc-sticker-tooling/blob/main/bot/slack-manifest.json). Make sure to change the bot's name and command before installing your bot, and set whatever you entered as the command name in the `SLACK_CMD` environment variable! Then, install it to your workspace, and take the token it gives you (starting with "xoxb"). This is your `SLACK_BOT_TOKEN`. After this, do one of the following:
    - If using Socket Mode, create an "App-Level Token" with the `connections:write` permission, and use that for your `SLACK_APP_TOKEN`.
    - If you are not using Socket Mode, set `SOCKET_MODE` to false. Then, replace `SLACK_APP_TOKEN` with `SLACK_SIGNING_SECRET` in the environment variable list, and set the value to the "Signing Secret" in your app settings. Uncomment the port from your deployment file/command, then set your Request URL on the "Interactivity & Shortcuts" page to `http://example.com:5000` (replacing example.com with your own domain).
3. StickerSRV: Download the [StickerSRV plugin](https://github.com/aelithron/mc-sticker-tooling/releases/latest), and install it to your Minecraft server's `plugins/` folder. Note it is only compatible with Minecraft Java servers running PaperMC v1.21.11+ and running [HCCore](https://github.com/hackclub/HCCore). Then, start and stop your server, and change the key in `plugins/StickerSRV/config.yml`. Start your server again. Now, the `STICKERSRV_URL` is your server's URL and port (formatted as `http://example.com:4500`), and `STICKERSRV_KEY` is your API key in the config.
4. Better Auth: Set `BETTER_AUTH_URL` to your web panel's address (formatted as `https://panel.example.com`, with a port if you are using one). Set `BETTER_AUTH_SECRET` to a randomly-generated string, which you can generate with `openssl rand -base64 32` if on macOS or Linux.
5. Hack Club Auth: Make sure Developer Mode is enabled on your account [info page](https://auth.hackclub.com/identity/edit). Then, go to [the dev portal](https://auth.hackclub.com/developer/apps/new). In this form, set the Redirect URI to `https://panel.example.com/api/auth/oauth2/callback/hca`, and enable the folowing scopes: `openid`, `email`, `name`, and `profile`. Create your app, and then your `HCA_CLIENT_ID` and `HCA_CLIENT_SECRET` are visible on the page.
### Deploy
#### With Compose (Recommended)
Save the following Docker Compose file as `compose.yml`. Make sure to fill in your environment variables! \
Once you have it saved, run `docker compose up -d`.
```yml
# Env vars! :3
# Fill these in using the instructions from the Environment Variables section above:
x-environment: &shared-env
  AIRTABLE_API_KEY: ""
  AIRTABLE_BASE_ID: ""
  AIRTABLE_TABLE_ID: ""
  SLACK_BOT_TOKEN: ""
  SLACK_APP_TOKEN: ""
  SLACK_CMD: ""
  OWNER_ID: ""
  SOCKET_MODE: true
  STICKERSRV_URL: ""
  STICKERSRV_KEY: ""
  BETTER_AUTH_URL: ""
  BETTER_AUTH_SECRET: ""
  HCA_CLIENT_ID: ""
  HCA_CLIENT_SECRET: ""

services:
  # Web panel
  panel:
    image: ghcr.io/aelithron/mc-sticker-tooling/panel:latest
    container_name: sticker-panel
    restart: unless-stopped
    environment: *shared-env
    volumes:
      - ./config:/config
    ports:
      - 3000:3000
  # Slack bot
  bot:
    image: ghcr.io/aelithron/mc-sticker-tooling/bot:latest
    container_name: sticker-bot
    restart: unless-stopped
    environment: *shared-env
    # Uncomment below if you are not using Socket Mode!
    #ports:
    #  - 5000:5000
```
#### With `docker run` (NOT recommended)
First, create a file with your environment variables: \
`nano .env` \
Fill these in using the instructions from the [Environment Variables](https://github.com/aelithron/mc-sticker-tooling/blob/main/README.md#environment-variables) section:
```env
AIRTABLE_API_KEY=""
AIRTABLE_BASE_ID=""
AIRTABLE_TABLE_ID=""
SLACK_BOT_TOKEN=""
SLACK_APP_TOKEN=""
SLACK_CMD=""
OWNER_ID=""
SOCKET_MODE=true
STICKERSRV_URL=""
STICKERSRV_KEY=""
BETTER_AUTH_URL=""
BETTER_AUTH_SECRET=""
HCA_CLIENT_ID=""
HCA_CLIENT_SECRET=""
```
Then, run the following commands in a terminal:
```
docker run -d --name sticker-panel --restart unless-stopped -p 3000:3000 -v "$(pwd)/config:/config" --env-file .env ghcr.io/aelithron/mc-sticker-tooling/panel:latest
docker run -d --name sticker-bot --restart unless-stopped -p 5000:5000 --env-file .env ghcr.io/aelithron/mc-sticker-tooling/bot:latest
```
### Configure
Some panel settings are controlled through a configuration file, which will be created in your current directory at `config/config.yml`. Fill this out with all of your parameters, then run `docker restart sticker-panel` in your terminal.

If you **aren't** using Socket Mode for the Slack bot, now is the time to enable events. Open the [Slack dev portal](https://api.slack.com/apps) back up, select your app, and go to Interactivity. Make sure that your URL is saved and that the switch is on. Then, go to Event Subscriptions and make sure that switch is on too. If these are off, turn them on.
### Access
In your browser, you can now go to `http://example.com:3000` (replace example.com with your domain), and you should see the panel. You can log in with the HCA account associated with your email (make sure this email is in the config file's `approvedUsers` array). Then, you can use the validation page to automatically approve/flag requests, and go to the sending page to get formatted mailing information (to mail letters to people). \
From here, I heavily recommend using a reverse proxy from here to enable SSL and allow access via port 443, but I don't provide a config file for that.

In Slack, you can run the command you set in the `SLACK_CMD` environment variable. The bot will then DM any users who haven't been DMed yet and have approved (but not confirmed) sticker requests. Those users can then use buttons in those DMs to confirm their request (and thus get priority in fulfillment over unconfirmed requests), change their address/name for mailing (which will also confirm their request after saving), or cancel their request and remove it from the queue.