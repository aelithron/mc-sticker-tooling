import dotenv from "dotenv";
import loadTable from "./loader.js";
import check from "./checker.js";
dotenv.config({ quiet: true });
async function start() {
  const table = await loadTable();
  for (const item of table) {
    try {
      const verdict = await check(item);
      console.log(verdict);
    } catch (e) {
      console.error(e);
      continue;
    }
  }
}
start();