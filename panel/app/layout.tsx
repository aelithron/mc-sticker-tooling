import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";

config.autoAddCss = false;
const quicksand = Quicksand({ weight: "500" });
export const metadata: Metadata = {
  title: { template: "%s | HC MC Fulfiller", default: "HC MC Fulfiller" },
  description: "Sticker fulfillment tool for Hack Club MC! :3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${quicksand.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
