import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";
export const auth = betterAuth({
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "hca",
          clientId: "e489af8679cbb10e9259796e205c3f71",
          clientSecret: "bebfec3f9a2801d84dec440fac5acb9495c5214942e742166ee9bcc3186bfd81",
          discoveryUrl: "https://auth.hackclub.com/.well-known/openid-configuration",
          scopes: ["openid", "email", "profile"]
        },
      ]
    })
  ]
});
export const authClient = createAuthClient();