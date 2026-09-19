import loadTable, { correctEntry, enterVerdict, loadValidatorCaches } from "@/utils/airtable";
import { auth } from "@/utils/auth";
import loadConfig, { setRunningValidator } from "@/utils/config";
import { NextRequest, NextResponse } from "next/server";
import check from "./checker";
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "unauthorized", message: "You aren't signed in, please sign in to continue!" }, { status: 401 });
  const config = await loadConfig();
  if (!session.user.emailVerified || (!config.approvedUsers.includes(session.user.email)) && !config.approvedUsers.includes("*")) return NextResponse.json({ error: "forbidden", message: "You don't have permission to use this, please ask an admin to add you!" }, { status: 403 });
  if (config.runningValidation) return NextResponse.json({ error: "running", message: "The validator is already running, try again later!" }, { status: 400 });
  runValidation();
  return NextResponse.json({ success: true });
}

async function runValidation() {
  try {
    setRunningValidator(true);
    const table = await loadTable("validator");
    const caches = await loadValidatorCaches();
    for (const item of table) {
      try {
        const verdict = await check(item, caches);
        await enterVerdict(item.recordID, verdict);
        if (verdict.correctionNeeded) await correctEntry(item);
      } catch (e) {
        console.error(e);
        continue;
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    setRunningValidator(false);
  }
}