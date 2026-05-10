import dotenv from "dotenv";
import loadTable, { loadCaches } from "./loader.js";
import check from "./checker.js";
dotenv.config({ quiet: true });
async function start() {
  const table = await loadTable();
  const caches = await loadCaches();
  for (const item of table) {
    try {
      const verdict = await check(item, caches);
      console.log({ recordID: item.recordID, ...verdict });
      if (verdict.approved) {
        console.log(`${item.recordID} - Approved`);
      } else {
        console.log(`${item.recordID} - Flagged (${verdict.errors.length} Error${verdict.errors.length !== 1 ? "s" : ""})`);
      }
    } catch (e) {
      console.error(e);
      continue;
    }
  }
}
start();