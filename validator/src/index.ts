import dotenv from "dotenv";
import loadTable from "./loader.js";
dotenv.config({ quiet: true });
async function start() {
  const table = await loadTable();
  for (const item of table) { console.log(item) }
}
start();