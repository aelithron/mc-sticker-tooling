import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";
export const auth = betterAuth({
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "hca",
          clientId: process.env.HCA_CLIENT_ID!,
          clientSecret: process.env.HCA_CLIENT_SECRET,
          discoveryUrl: "https://auth.hackclub.com/.well-known/openid-configuration",
          scopes: ["openid", "email", "profile"]
        },
      ]
    })
  ]
});
export const authClient = createAuthClient();