import fs from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as z from "zod";

export const Config = z.strictObject({
  approvedUsers: z.array(z.string()),
  returnAddress: z.strictObject({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
    name: z.string()
  }),
  confirmedOnly: z.boolean()
});
export default async function loadConfig(): Promise<z.Infer<typeof Config>> {
  const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../config/config.json');
  try {
    await fs.access(configPath, fs.constants.F_OK | fs.constants.R_OK);
  } catch {
    console.warn("Config is missing, copying default...");
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.copyFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "../example.config.json"), configPath, fs.constants.COPYFILE_EXCL);
    await fs.chmod(configPath, 0o666);
  }
  return Config.parse(JSON.parse(await fs.readFile(configPath, "utf8")));
}