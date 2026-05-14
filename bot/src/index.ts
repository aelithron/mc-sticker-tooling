import { App } from "@slack/bolt";

let app;
async function start() {
  if (process.env.SOCKET_MODE) {
    app = new App({
      token: process.env.SLACK_BOT_TOKEN!,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN!,
    });
  } else {
    app = new App({
      token: process.env.SLACK_BOT_TOKEN!,
      socketMode: false,
      signingSecret: process.env.SLACK_SIGNING_SECRET!,
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000
    });
  }
  await app.start();
}
start()