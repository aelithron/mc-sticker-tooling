import dotenv from "dotenv";
import loadTable, { enterVerdict, loadCaches } from "./airtable.js";
import check from "./checker.js";
dotenv.config({ quiet: true });
async function start() {
  console.log("Loading from Airtable...")
  const table = await loadTable();
  const caches = await loadCaches();
  console.log("Beginning to check...")
  for (const item of table) {
    try {
      const verdict = await check(item, caches);
      await enterVerdict(item.recordID, verdict);
      console.log({ recordID: item.recordID, ...verdict });
    } catch (e) {
      console.error(e);
      continue;
    }
  }
}
start();